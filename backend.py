from fastapi import FastAPI, UploadFile, Form
import pandas as pd
import math
import io
from fastapi.middleware.cors import CORSMiddleware
from scipy.stats import chisquare
import numpy as np

app = FastAPI()

# Allow frontend (React) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Benford theoretical distribution
def benford_distribution():
    return {str(d): math.log10(1 + 1/d) * 100 for d in range(1, 10)}

# Get leading digit of a number
def leading_digit(num):
    str_num = str(abs(float(num))).lstrip("0.")
    if str_num and str_num[0].isdigit() and str_num[0] != '0':
        return int(str_num[0])
    return None

def calculate_risk_level(chi2_p_value, benford_compliance, total_records):
    """Calculate risk level based on multiple factors"""
    risk_score = 0
    
    # Chi-square test contribution (40% weight)
    if chi2_p_value < 0.001:  # Very significant deviation
        risk_score += 40
    elif chi2_p_value < 0.01:  # Significant deviation
        risk_score += 30
    elif chi2_p_value < 0.05:  # Moderately significant
        risk_score += 20
    else:  # Not significant
        risk_score += 0
    
    # Benford compliance contribution (40% weight)
    if benford_compliance < 60:  # Poor compliance
        risk_score += 40
    elif benford_compliance < 75:  # Fair compliance
        risk_score += 25
    elif benford_compliance < 85:  # Good compliance
        risk_score += 10
    else:  # Excellent compliance
        risk_score += 0
    
    # Sample size consideration (20% weight)
    if total_records < 100:  # Small sample size increases uncertainty
        risk_score += 20
    elif total_records < 500:
        risk_score += 10
    elif total_records < 1000:
        risk_score += 5
    
    return min(risk_score, 100)  # Cap at 100%

def get_suspicion_level(chi2_p_value, benford_compliance):
    """Determine suspicion level based on both tests"""
    chi_square_pass = chi2_p_value >= 0.05  # Null hypothesis: follows Benford's Law
    benford_pass = benford_compliance >= 75  # Arbitrary threshold for good compliance
    
    if chi_square_pass and benford_pass:
        return {
            "level": "Low Suspicion",
            "description": "Data follows Benford's Law pattern and passes chi-square test",
            "color": "#10b981",
            "tests_passed": ["Benford's Law Compliance", "Chi-Square Test"]
        }
    elif chi_square_pass or benford_pass:
        return {
            "level": "Medium Suspicion", 
            "description": "Data partially conforms to expected patterns",
            "color": "#f59e0b",
            "tests_passed": ["Chi-Square Test" if chi_square_pass else "Benford's Law Compliance"]
        }
    else:
        return {
            "level": "High Suspicion",
            "description": "Data significantly deviates from Benford's Law pattern",
            "color": "#ef4444",
            "tests_passed": []
        }

@app.post("/analyze-column")
async def analyze(file: UploadFile, column_name: str = Form(...)):
    try:
        # Read CSV file
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))

        # Validate column
        if column_name not in df.columns:
            return {"error": f"Column '{column_name}' not found."}

        # Extract numeric values and their leading digits
        numbers = []
        for x in df[column_name]:
            try:
                num = float(x)
                if num > 0:  # Only positive numbers for Benford's Law
                    digit = leading_digit(num)
                    if digit:
                        numbers.append(digit)
            except:
                continue

        if len(numbers) < 10:
            return {"error": "Insufficient numeric data for analysis. Need at least 10 valid positive numbers."}

        # Count leading digits
        counts = {str(d): 0 for d in range(1, 10)}
        for digit in numbers:
            counts[str(digit)] += 1

        total = len(numbers)
        actual_percentages = {k: (v / total) * 100 for k, v in counts.items()}

        # Benford expected distribution
        benford_percentages = benford_distribution()

        # Calculate Benford compliance (inverse of total absolute deviation)
        total_deviation = sum(abs(actual_percentages[str(d)] - benford_percentages[str(d)]) 
                            for d in range(1, 10))
        benford_compliance = max(0, 100 - (total_deviation / 2))  # Normalize to 0-100%

        # Chi-square test
        observed = [counts[str(d)] for d in range(1, 10)]
        expected = [benford_percentages[str(d)] * total / 100 for d in range(1, 10)]

        # Avoid division by zero in chi-square test
        expected = [max(e, 0.1) for e in expected]
        
        chi2, p_value = chisquare(f_obs=observed, f_exp=expected)

        # Calculate risk level
        risk_score = calculate_risk_level(p_value, benford_compliance, total)
        
        # Get suspicion level
        suspicion = get_suspicion_level(p_value, benford_compliance)

        # Deviation per digit (actual - expected)
        deviation = {str(d): actual_percentages[str(d)] - benford_percentages[str(d)] 
                    for d in range(1, 10)}

        return {
            "success": True,
            "total_records": total,
            "actual_percentages": actual_percentages,
            "benford_percentages": benford_percentages,
            "counts": counts,
            "chi_square": float(chi2),
            "p_value": float(p_value),
            "deviation": deviation,
            "benford_compliance": round(benford_compliance, 2),
            "risk_score": round(risk_score, 1),
            "suspicion": suspicion,
            "chart_data": {
                "digits": [str(d) for d in range(1, 9)],
                "actual": [actual_percentages[str(d)] for d in range(1, 9)],
                "benford": [benford_percentages[str(d)] for d in range(1, 9)]
            }
        }
        
    except Exception as e:
        return {"error": f"Error processing file: {str(e)}"}

@app.get("/")
async def root():
    return {"message": "Benford's Law Analysis API"}