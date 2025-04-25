import { motion } from 'framer-motion';
import { AlertOctagon, AlertCircle, CheckCircle, Info, ExternalLink, Pill, Clock, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PrescriptionAnalysis } from '@/services/prescriptionService';

interface PrescriptionResultProps {
  result: PrescriptionAnalysis | null;
}

export const PrescriptionResult = ({ result }: PrescriptionResultProps) => {
  if (!result) return null;

  // Ensure we have default values for all nested objects
  const precautions = result.precautions || {
    dietary_restrictions: [],
    activity_limitations: [],
    side_effects: []
  };

  const duration = result.duration || {
    total_days: null,
    frequency: 'Not specified',
    timing: 'Not specified'
  };

  const warnings = result.warnings || {
    drug_interactions: [],
    contraindications: [],
    overdose_symptoms: []
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Precautions */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="h-6 w-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mr-2">
            <AlertCircle size={14} />
          </span>
          Precautions
        </h3>
        
        {/* Dietary Restrictions */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">Dietary Restrictions</h4>
          {precautions.dietary_restrictions?.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {precautions.dietary_restrictions.map((item, idx) => (
                <li key={idx} className="text-gray-700">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No specific dietary restrictions identified.</p>
          )}
        </div>
        
        {/* Activity Limitations */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">Activity Limitations</h4>
          {precautions.activity_limitations?.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {precautions.activity_limitations.map((item, idx) => (
                <li key={idx} className="text-gray-700">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No specific activity limitations identified.</p>
          )}
        </div>
        
        {/* Side Effects */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">Side Effects to Monitor</h4>
          {precautions.side_effects?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {precautions.side_effects.map((effect, idx) => (
                <span 
                  key={idx} 
                  className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                >
                  {effect}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No specific side effects identified to monitor.</p>
          )}
        </div>
      </div>

      {/* Duration */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2">
            <Clock size={14} />
          </span>
          Duration &amp; Timing
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Treatment Duration</h4>
            <p className="text-gray-700">
              {duration.total_days 
                ? `${duration.total_days} days` 
                : "Duration not specified"}
            </p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Frequency</h4>
            <p className="text-gray-700">{duration.frequency || 'Not specified'}</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Timing Instructions</h4>
            <p className="text-gray-700">{duration.timing || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Warnings */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="h-6 w-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-2">
            <ShieldAlert size={14} />
          </span>
          Warnings
        </h3>
        
        {/* Drug Interactions */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">Drug Interactions</h4>
          {warnings.drug_interactions?.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {warnings.drug_interactions.map((item, idx) => (
                <li key={idx} className="text-gray-700">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No specific drug interactions identified.</p>
          )}
        </div>
        
        {/* Contraindications */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">Contraindications</h4>
          {warnings.contraindications?.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {warnings.contraindications.map((item, idx) => (
                <li key={idx} className="text-gray-700">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No specific contraindications identified.</p>
          )}
        </div>
        
        {/* Overdose Symptoms */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">Overdose Symptoms</h4>
          {warnings.overdose_symptoms?.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {warnings.overdose_symptoms.map((item, idx) => (
                <li key={idx} className="text-gray-700">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No specific overdose symptoms identified.</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button className="btn-primary" asChild>
          <Link to="/doctors">
          <span>Book Doctor Consultation</span>
          </Link>
        </Button>
        <Button variant="outline">
          <span>Download Report</span>
        </Button>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <AlertCircle size={14} className="inline mr-1" />
        This analysis is for informational purposes only and does not constitute medical advice. Always consult with a healthcare professional.
      </div>
    </motion.div>
  );
};
