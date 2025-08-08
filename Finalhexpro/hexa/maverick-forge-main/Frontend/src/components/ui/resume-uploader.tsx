import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Brain, CheckCircle, Loader2, X, AlertCircle } from "lucide-react";
import { useDarkMode } from "@/contexts/DarkModeContext";

interface ResumeUploaderProps {
  onUpload?: (file: File) => void;
  onParse?: (skills: string[]) => void;
  onError?: (error: string) => void;
  className?: string;
  title?: string;
  description?: string;
  showParseButton?: boolean;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  showCourseRecommendation?: boolean;
}

interface ParsedData {
  skills: string[];
}

export function ResumeUploader({
  onUpload,
  onParse,
  onError,
  className = "",
  title = "Resume Upload",
  description = "Upload your resume to extract and update your skills",
  showParseButton = true,
  maxFileSize = 10, // 10MB default
  allowedTypes = [".pdf", ".docx"],
  showCourseRecommendation = false
}: ResumeUploaderProps) {
  const { darkMode } = useDarkMode();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isValidType = allowedTypes.some(type => 
      type.startsWith('.') ? fileExtension === type.slice(1) : file.type === type
    );

    if (!isValidType) {
      return `Please upload a ${allowedTypes.join(' or ')} file`;
    }

    return null;
  };

  const parseResumeWithAI = async (file: File): Promise<ParsedData> => {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('http://localhost:5001/parse_resume', {
        method: 'POST',
        body: formData,
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend server is not responding correctly. Please ensure the Python Flask backend is running on http://localhost:5001');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse resume');
      }

      const data = await response.json();
      
      return {
        skills: data.skills || [],
      };
    } catch (error) {
      console.error('AI parsing error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to Python Flask backend server. Please ensure the backend is running on http://localhost:5001');
      }
      throw error;
    }
  };

  const handleFileSelect = (file: File) => {
    setError("");
    setParsedData(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    onUpload?.(file);
  };

  const handleParseResume = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadProgress(0);
    setError("");

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Use mock AI parsing
      const parsed = await parseResumeWithAI(selectedFile);
      
      setParsedData(parsed);
      setUploadProgress(100);
      
      onParse?.(parsed.skills);
      
    } catch (error: any) {
      console.error('Resume parsing error:', error);
      setError(error.message || "Failed to parse resume");
      onError?.(error.message || "Failed to parse resume");
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const resetUploader = () => {
    setSelectedFile(null);
    setParsedData(null);
    setError("");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className={`shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : className || 'bg-white'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-purple-800'} dashboard-card-title`}>
          <Brain className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-purple-600'}`} />
          {title}
        </CardTitle>
        {description && (
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-purple-700'}`}>{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              darkMode 
                ? 'border-gray-600 hover:border-blue-400/50' 
                : 'border-gray-300 hover:border-blue-500/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : ''}`}>Upload your resume</p>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Drag and drop or click to select a {allowedTypes.join(' or ')} file
              <br />
              <span className="text-xs">Maximum file size: {maxFileSize}MB</span>
            </p>
            <Button variant="outline" className={darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}>
              <FileText className="w-4 h-4 mr-2" />
              Choose File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={allowedTypes.join(',')}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <FileText className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${darkMode ? 'text-white' : ''}`}>{selectedFile.name}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetUploader}
                className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {error && (
              <div className={`flex items-center gap-2 p-3 border rounded-lg ${
                darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
              }`}>
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>{error}</span>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : ''}`}>Processing resume...</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {showParseButton && !isProcessing && (
              <Button 
                onClick={handleParseResume}
                className="w-full"
                disabled={!selectedFile}
              >
                <Brain className="w-4 h-4 mr-2" />
                Update Skills from Resume
              </Button>
            )}

            {parsedData && !isProcessing && (
              <div className="space-y-4">
                <div className={`p-4 border rounded-lg ${
                  darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-800'}`}>
                      Profile Updated Successfully!
                    </span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                    Successfully updated your profile with {parsedData.skills.length} skills from your resume. Check your profile section for updated skills and training schedules for course recommendations.
                  </p>
                </div>

                {parsedData.skills.length > 0 && (
                  <div>
                    <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : ''}`}>Updated Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className={darkMode ? 'bg-gray-600 text-gray-300' : ''}>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 