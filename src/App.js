import React, { useState } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, Download, ChevronDown } from 'lucide-react';

const DataFraudulentTest = () => {
  const [file, setFile] = useState(null);
  const [currentStep, setCurrentStep] = useState('upload');
  const [selectedColumns, setSelectedColumns] = useState('all');
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

  const runFraudAnalysis = () => {
    setIsAnalyzing(true);
    setCurrentStep('results');
    setTimeout(() => {
      const totalRecords = csvData?.totalRows || 0;
      const mockResults = {
        totalRecords: totalRecords,
        analysisScope: selectedColumns === 'all' ? 'all columns' : `column: ${selectedColumns}`,
        suspiciousRecords: Math.floor(totalRecords * 0.05) + Math.floor(Math.random() * 10),
        riskScore: Math.floor(Math.random() * 40) + 10,
        anomalies: [
          'Duplicate transaction patterns detected',
          'Unusual time-based clustering',
          'Statistical outliers in amount field',
          'Inconsistent vendor information'
        ],
        confidence: Math.floor(Math.random() * 30) + 70
      };
      setResults(mockResults);
      setIsAnalyzing(false);
    }, 3000);
  };

  const resetAnalysis = () => {
    setFile(null);
    setResults(null);
    setIsAnalyzing(false);
    setCsvData(null);
    setSelectedColumns('all');
    setCurrentStep('upload');
  };

  const goBackToUpload = () => {
    setCurrentStep('upload');
    setFile(null);
    setCsvData(null);
    setSelectedColumns('all');
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
            Data Fraudulent Test
          </h1>
          {currentStep === 'upload' && (
            <p style={{
              fontSize: '1.25rem',
              color: '#4b5563',
              maxWidth: '512px',
              margin: '0 auto'
            }}>
              Advanced fraud detection system to analyze your CSV data for suspicious patterns and anomalies
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
                How It Works
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px',
                color: '#4b5563'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Upload style={{ color: '#2563eb' }} size={32} />
                  <h4 style={{ fontWeight: '500', color: '#1f2937' }}>1. Upload CSV</h4>
                  <p style={{ fontSize: '0.875rem' }}>Upload your transaction or financial data in CSV format</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle style={{ color: '#f59e0b' }} size={32} />
                  <h4 style={{ fontWeight: '500', color: '#1f2937' }}>2. AI Analysis</h4>
                  <p style={{ fontSize: '0.875rem' }}>Our AI examines patterns for fraudulent indicators</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle style={{ color: '#059669' }} size={32} />
                  <h4 style={{ fontWeight: '500', color: '#1f2937' }}>3. Get Results</h4>
                  <p style={{ fontSize: '0.875rem' }}>Receive detailed fraud risk assessment and recommendations</p>
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
                Select Columns to be Analyzed
              </h2>
              
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedColumns}
                  onChange={(e) => setSelectedColumns(e.target.value)}
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
                  <option value="all">All Columns ({csvData?.totalColumns || 0})</option>
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

              {csvData && (
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
                    {selectedColumns === 'all' 
                      ? `All ${csvData.totalColumns} columns` 
                      : `Column: ${selectedColumns}`}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Total Records to Analyze: {csvData.totalRows}
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
                onClick={runFraudAnalysis}
                style={buttonPrimaryStyle}
                onMouseOver={(e) => e.target.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #3730a3 100%)'}
                onMouseOut={(e) => e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)'}
              >
                Analyze
              </button>
            </div>
          </div>
        )}

        {currentStep === 'results' && (
          <div style={{ maxWidth: '896px', margin: '0 auto' }}>
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
                <p style={{ color: '#6b7280' }}>Running fraud detection algorithms on selected columns</p>
                <style>{`
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : results && (
              <div style={cardStyle}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <AlertTriangle style={{ marginRight: '12px', color: '#f59e0b' }} />
                  Analysis Results
                </h2>

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
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                  }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#1e40af', marginBottom: '8px' }}>
                      Total Records
                    </h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                      {results.totalRecords.toLocaleString()}
                    </p>
                  </div>
                  
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                  }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#dc2626', marginBottom: '8px' }}>
                      Suspicious Records
                    </h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                      {results.suspiciousRecords}
                    </p>
                  </div>
                  
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                  }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#d97706', marginBottom: '8px' }}>
                      Risk Score
                    </h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                      {results.riskScore}%
                    </p>
                  </div>
                  
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                  }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#059669', marginBottom: '8px' }}>
                      Confidence
                    </h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                      {results.confidence}%
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                    Risk Assessment
                  </h3>
                  <div style={{
                    background: '#f9fafb',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ color: '#374151' }}>Risk Level</span>
                      <span style={{
                        fontWeight: '500',
                        color: results.riskScore < 30 ? '#059669' : 
                               results.riskScore < 60 ? '#f59e0b' : '#dc2626'
                      }}>
                        {results.riskScore < 30 ? 'Low' : 
                         results.riskScore < 60 ? 'Medium' : 'High'}
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
                        width: `${results.riskScore}%`,
                        background: results.riskScore < 30 ? '#10b981' : 
                                   results.riskScore < 60 ? '#f59e0b' : '#ef4444'
                      }}></div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                    Detected Anomalies
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {results.anomalies.map((anomaly, index) => (
                      <div key={index} style={{
                        background: 'rgba(254, 242, 242, 1)',
                        border: '1px solid rgba(252, 165, 165, 1)',
                        borderRadius: '8px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'flex-start'
                      }}>
                        <AlertTriangle style={{
                          color: '#ef4444',
                          marginRight: '12px',
                          marginTop: '2px',
                          flexShrink: 0
                        }} size={20} />
                        <span style={{ color: '#374151' }}>{anomaly}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button style={{
                    ...buttonPrimaryStyle,
                    background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Download style={{ marginRight: '8px' }} size={20} />
                    Download Report
                  </button>
                  <button 
                    onClick={resetAnalysis}
                    style={buttonSecondaryStyle}
                    onMouseOver={(e) => e.target.style.background = '#4b5563'}
                    onMouseOut={(e) => e.target.style.background = '#6b7280'}
                  >
                    Analyze New File
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataFraudulentTest;