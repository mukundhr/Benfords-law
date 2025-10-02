from fastapi import FastAPI, UploadFile, Form
import pandas as pd
import math
import io
from fastapi.middleware.cors import CORSMiddleware
from scipy.stats import chisquare

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
    return int(str(num).lstrip("0.")[0])

@app.post("/analyze-column")
async def analyze(file: UploadFile, column_name: str = Form(...)):
    # Read CSV file
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content))

    # Validate column
    if column_name not in df.columns:
        return {"error": f"Column '{column_name}' not found."}

    # Extract numeric values
    numbers = []
    for x in df[column_name]:
        try:
            num = float(x)
            if num > 0:
                numbers.append(num)
        except:
            continue

    # Count leading digits
    counts = {str(d): 0 for d in range(1, 10)}
    for num in numbers:
        d = leading_digit(num)
        if str(d) in counts:
            counts[str(d)] += 1

    total = sum(counts.values())
    actual = {k: (v / total) * 100 if total > 0 else 0 for k, v in counts.items()}

    # Benford expected distribution
    benford = benford_distribution()

    # Chi-square test
    observed = [counts[str(d)] for d in range(1, 10)]
    expected = [benford[str(d)] * total / 100 for d in range(1, 10)]

    chi2, p_value = chisquare(f_obs=observed, f_exp=expected)

    # Deviation per digit (actual - expected)
    deviation = {str(d): actual[str(d)] - benford[str(d)] for d in range(1, 10)}

    return {
        "actual": actual,
        "benford": benford,
        "counts": counts,
        "chi_square": chi2,
        "p_value": p_value,
        "deviation": deviation
    }
