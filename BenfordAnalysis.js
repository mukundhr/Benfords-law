import React, { useState } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, Download, ChevronDown, BarChart3, TrendingUp, Shield, AlertCircle } from 'lucide-react';

const BenfordAnalysis = () => {
  const [file, setFile] = useState(null);
  const [currentStep, setCurrentStep] = useState('upload');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [csvData, setCsvData] = useState(null);

  const handleFileUpload = (uploadedFile) => {
    if (uploadedFile && uploadedFile.type === 'text/csv') {
      setFile(uploadedFile);
      setResults(null);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim());
          const headers = lines[0] ? lines[0].split(',').map(h => h.trim()) : [];
          
          setCsvData({
            headers: headers,
            totalRows: Math.max(0, lines.length - 1),
            totalColumns: headers.length
          });
          setCurrentStep('select');
        } catch (error) {
          alert('Error reading CSV file. Please try again.');
          console.error('CSV parsing error:', error);
        }
      };
      reader.readAsText(uploadedFile);
    } else {
      alert('Please upload a CSV file only');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileUpload(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const runBenfordAnalysis = async () => {
    if (!file || !selectedColumn) {
      alert('Please select a file and column');
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep('results');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('column_name', selectedColumn);

      const response = await fetch('http://localhost:8000/analyze-column', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
        setCurrentStep('select');
      } else {
        setResults(data);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Error analyzing data. Please check if the backend server is running.');
      setCurrentStep('select');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setResults(null);
    setIsAnalyzing(false);
    setCsvData(null);
    setSelectedColumn('');
    setCurrentStep('upload');
  };

  const goBackToUpload = () => {
    setCurrentStep('upload');
    setFile(null);
    setCsvData(null);
    setSelectedColumn('');
  };

  // Bar Chart Component
  const BarChart = ({ data }) => {
    if (!data) return null;

    const maxValue = Math.max(
      ...data.actual,
      ...data.benford
    );

    return (
      <div style={{ width: '100%', height: '400px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'end', height: '350px', gap: '8px' }}>
          {data.digits.map((digit, index) => {
            const actualHeight = (data.actual[index] / maxValue) * 300;
            const benfordHeight = (data.benford[index] / maxValue) * 300;
            
            return (
              <div key={digit} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'end', gap: '4px', height: '300px' }}>
                  <div style={{
                    width: '20px',
                    height: `${actualHeight}px`,
                    backgroundColor: '#3b82f6',
                    borderRadius: '4px 4px 0 0',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-25px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '10px',
                      color: '#3b82f6',
                      fontWeight: 'bold'
                    }}>
                      {data.actual[index].toFixed(1)}%
                    </div>
                  </div>
                  <div style={{
                    width: '20px',
                    height: `${benfordHeight}px`,
                    backgroundColor: '#ef4444',
                    borderRadius: '4px 4px 0 0',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-25px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '10px',
                      color: '#ef4444',
                      fontWeight: 'bold'
                    }}>
                      {data.benford[index].toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '10px', fontSize: '14px', fontWeight: 'bold' }}>{digit}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
            <span style={{ fontSize: '14px' }}>Actual Data</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', backgroundColor: '#ef4444', borderRadius: '2px' }}></div>
            <span style={{ fontSize: '14px' }}>Benford's Law</span>
          </div>
        </div>
      </div>
    );
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e1f5fe 50%, #e8eaf6 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(229, 231, 235, 0.8)',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    padding: '32px',
    marginBottom: '32px'
  };

  const uploadAreaStyle = {
    border: dragOver ? '2px dashed #3b82f6' : '2px dashed #9ca3af',
    borderRadius: '12px',
    padding: '48px',
    textAlign: 'center',
    position: 'relative',
    background: dragOver ? '#eff6ff' : 'transparent',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const buttonPrimaryStyle = {
    background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    flex: 1
  };

  const buttonSecondaryStyle = {
    background: '#6b7280',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    flex: 1
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px'
          }}>
            Benford's Law Analysis
          </h1>
          {currentStep === 'upload' && (
            <p style={{
              fontSize: '1.25rem',
              color: '#4b5563',
              maxWidth: '512px',
              margin: '0 auto'
            }}>
              Detect potential fraud in numerical data using Benford's Law and statistical analysis
            </p>
          )}
        </div>

        {currentStep === 'upload' && (
          <div style={{ maxWidth: '896px', margin: '0 auto' }}>
            <div style={cardStyle}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Upload style={{ marginRight: '12px', color: '#2563eb' }} />
                Upload CSV Data
              </h2>
              
              <div 
                style={uploadAreaStyle}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <Upload style={{ color: '#6b7280' }} size={48} />
                  <div>
                    <p style={{ color: '#1f2937', fontWeight: '500', marginBottom: '8px' }}>
                      Drop your CSV file here or click to browse
                    </p>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      Supports CSV files up to 10MB
                    </p>
                  </div>
                </div>
                
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            <div style={{
              ...cardStyle,
              background: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                How Benford's Law Works
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px',
                color: '#4b5563'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 style={{ color: '#2563eb' }} size={32} />
                  <h4 style={{ fontWeight: '500', color: '#1f2937' }}>1. Upload & Select</h4>
                  <p style={{ fontSize: '0.875rem' }}>Upload CSV and select numerical column to analyze</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp style={{ color: '#f59e0b' }} size={32} />
                  <h4 style={{ fontWeight: '500', color: '#1f2937' }}>2. Statistical Analysis</h4>
                  <p style={{ fontSize: '0.875rem' }}>Compare first digit distribution to Benford's Law</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Shield style={{ color: '#059669' }} size={32} />
                  <h4 style={{ fontWeight: '500', color: '#1f2937' }}>3. Fraud Detection</h4>
                  <p style={{ fontSize: '0.875rem' }}>Get risk assessment and compliance scores</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'select' && (
          <div style={{ maxWidth: '512px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={cardStyle}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px', textAlign: 'center' }}>
                Selected File
              </h2>
              <div style={{
                background: '#f9fafb',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText style={{ color: '#2563eb', marginRight: '12px' }} size={24} />
                <div>
                  <p style={{ color: '#1f2937', fontWeight: '500' }}>{file?.name || 'No file selected'}</p>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {csvData ? `${csvData.totalRows} rows • ${csvData.totalColumns} columns` : ''} • {file ? (file.size / 1024).toFixed(1) : '0'} KB
                  </p>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px', textAlign: 'center' }}>
                Select Numerical Column
              </h2>
              
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '16px',
                    color: '#1f2937',
                    appearance: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    outline: 'none'
                  }}
                >
                  <option value="">Select a column...</option>
                  {csvData?.headers?.map((header, index) => (
                    <option key={index} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
                <ChevronDown style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                  pointerEvents: 'none'
                }} size={20} />
              </div>

              {selectedColumn && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '8px' }}>
                    Selected for Analysis:
                  </p>
                  <p style={{ color: '#1f2937', fontSize: '0.875rem', fontWeight: '500' }}>
                    Column: {selectedColumn}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Total Records: {csvData?.totalRows}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={goBackToUpload}
                style={{
                  ...buttonSecondaryStyle,
                  background: '#6b7280'
                }}
                onMouseOver={(e) => e.target.style.background = '#4b5563'}
                onMouseOut={(e) => e.target.style.background = '#6b7280'}
              >
                Back to Upload
              </button>
              <button
                onClick={runBenfordAnalysis}
                disabled={!selectedColumn}
                style={{
                  ...buttonPrimaryStyle,
                  opacity: selectedColumn ? 1 : 0.5,
                  cursor: selectedColumn ? 'pointer' : 'not-allowed'
                }}
                onMouseOver={(e) => {
                  if (selectedColumn) {
                    e.target.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #3730a3 100%)';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedColumn) {
                    e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)';
                  }
                }}
              >
                Analyze with Benford's Law
              </button>
            </div>
          </div>
        )}

        {currentStep === 'results' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {isAnalyzing ? (
              <div style={{
                ...cardStyle,
                padding: '64px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  border: '2px solid transparent',
                  borderTop: '2px solid #2563eb',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 24px'
                }}></div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                  Analyzing Data...
                </h2>
                <p style={{ color: '#6b7280' }}>Running Benford's Law analysis and chi-square test</p>
                <style>{`
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : results && (
              <>
                {/* Suspicion Level Alert */}
                <div style={{
                  ...cardStyle,
                  background: `rgba(${results.suspicion.color === '#10b981' ? '16, 185, 129' : 
                                    results.suspicion.color === '#f59e0b' ? '245, 158, 11' : '239, 68, 68'}, 0.1)`,
                  border: `1px solid ${results.suspicion.color}`,
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    {results.suspicion.level === 'Low Suspicion' ? 
                      <CheckCircle style={{ color: results.suspicion.color, marginRight: '12px' }} size={24} /> :
                      <AlertCircle style={{ color: results.suspicion.color, marginRight: '12px' }} size={24} />
                    }
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: results.suspicion.color, margin: 0 }}>
                      {results.suspicion.level}
                    </h2>
                  </div>
                  <p style={{ color: '#374151', marginBottom: '16px' }}>{results.suspicion.description}</p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#374151', fontWeight: '500' }}>Tests Passed:</span>
                    {results.suspicion.tests_passed.length > 0 ? (
                      results.suspicion.tests_passed.map((test, index) => (
                        <span key={index} style={{
                          background: results.suspicion.color,
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.875rem'
                        }}>
                          {test}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: '#6b7280', fontStyle: 'italic' }}>None</span>
                    )}
                  </div>
                </div>

                {/* Key Metrics */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '24px',
                  marginBottom: '32px'
                }}>
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#1e40af', marginBottom: '8px' }}>
                      Total Records
                    </h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                      {results.total_records.toLocaleString()}
                    </p>
                  </div>
                  
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#059669', marginBottom: '8px' }}>
                      Benford Compliance
                    </h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                      {results.benford_compliance}%
                    </p>
                  </div>
                  
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                  }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#d97706', marginBottom: '8px' }}>
                      Risk Score
                    </h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                      {results.risk_score}%
                    </p>
                  </div>
                  
                  <div style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                  }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#7c3aed', marginBottom: '8px' }}>
                      Chi-Square p-value
                    </h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                      {results.p_value.toFixed(4)}
                    </p>
                  </div>
                </div>

                {/* Bar Chart */}
                <div style={cardStyle}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <BarChart3 style={{ marginRight: '12px', color: '#2563eb' }} />
                    First Digit Distribution Comparison
                  </h2>
                  <BarChart data={results.chart_data} />
                </div>

                {/* Statistical Tests */}
                <div style={cardStyle}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                    Statistical Analysis
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    <div style={{
                      background: '#f9fafb',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <h4 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '12px' }}>Chi-Square Test</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#374151' }}>Test Statistic:</span>
                        <span style={{ fontWeight: '500' }}>{results.chi_square.toFixed(4)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#374151' }}>p-value:</span>
                        <span style={{ fontWeight: '500' }}>{results.p_value.toFixed(4)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#374151' }}>Significance (α=0.05):</span>
                        <span style={{
                          fontWeight: '500',
                          color: results.p_value >= 0.05 ? '#059669' : '#dc2626'
                        }}>
                          {results.p_value >= 0.05 ? 'Not Significant' : 'Significant'}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      background: '#f9fafb',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <h4 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '12px' }}>Risk Assessment</h4>
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <span style={{ color: '#374151' }}>Risk Level</span>
                          <span style={{
                            fontWeight: '500',
                            color: results.risk_score < 30 ? '#059669' : 
                                   results.risk_score < 60 ? '#f59e0b' : '#dc2626'
                          }}>
                            {results.risk_score < 30 ? 'Low' : 
                             results.risk_score < 60 ? 'Medium' : 'High'}
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          background: '#d1d5db',
                          borderRadius: '6px',
                          height: '12px'
                        }}>
                          <div style={{
                            height: '12px',
                            borderRadius: '6px',
                            transition: 'all 1s ease',
                            width: `${results.risk_score}%`,
                            background: results.risk_score < 30 ? '#10b981' : 
                                       results.risk_score < 60 ? '#f59e0b' : '#ef4444'
                          }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                  <button 
                    onClick={resetAnalysis}
                    style={buttonSecondaryStyle}
                    onMouseOver={(e) => e.target.style.background = '#4b5563'}
                    onMouseOut={(e) => e.target.style.background = '#6b7280'}
                  >
                    Analyze New File
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BenfordAnalysis;