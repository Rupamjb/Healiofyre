const axios = require('axios');
const Prescription = require('../models/Prescription');

/**
 * @desc    Get AI-powered chatbot response
 * @route   POST /api/chatbot
 * @access  Private
 */
exports.getChatbotResponse = async (req, res) => {
  try {
    const { query, contextType = 'general' } = req.body;

    // Validate query
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Query is required' });
    }

    let prescription = null;
    
    // If contextType is "prescription", fetch the user's latest prescription
    if (contextType === 'prescription') {
      prescription = await Prescription.findOne({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .lean();
    }

    // Call Groq API for chatbot response
    let response;
    
    try {
      response = await callGroqAPI(query, contextType, prescription);
    } catch (error) {
      console.error('Groq API error:', error);
      // Provide mock response for demo purposes if API fails
      response = getMockResponse(query, prescription);
    }

    // Return response
    return res.status(200).json({
      response
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    return res.status(500).json({ 
      error: 'Server error during chatbot query' 
    });
  }
};

/**
 * Call Groq API to get chatbot response
 * @param {string} query - The user's question
 * @param {string} contextType - The context type (prescription or general)
 * @param {object|null} prescription - The user's latest prescription (if available)
 * @returns {string} - AI-generated response
 */
async function callGroqAPI(query, contextType, prescription) {
  // Get API key from environment variables
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('Groq API key is not configured');
  }

  // Define the system role based on context type
  const systemRole = contextType === 'prescription' 
    ? 'You are a helpful healthcare assistant specializing in medication advice and prescription information. Provide concise, accurate responses (1-2 sentences) based on prescription details when available.'
    : 'You are a helpful healthcare assistant that provides concise, accurate responses to general health-related questions. Keep responses short (1-2 sentences) for demonstration purposes.';

  // Prepare prompt based on context type
  let prompt;
  
  if (contextType === 'prescription' && prescription?.ocrText) {
    // For prescription context, use the detailed analysis format
    prompt = {
      "prescription_text": prescription.ocrText,
      "user_query": query,
      "instructions": "Analyze this prescription as a senior pharmacist and answer the user query based on the prescription details:",
      "requirements": {
        "precautions": {
          "dietary_restrictions": "List food/drinks to avoid",
          "activity_limitations": "Physical/mental activity warnings",
          "side_effects": "Common side effects to monitor"
        },
        "duration": {
          "total_days": "Numeric value only",
          "frequency": "Exact times per day",
          "timing": "Morning/evening/with-meal instructions"
        },
        "warnings": {
          "drug_interactions": "List dangerous combinations",
          "contraindications": "Conditions where medication should be avoided",
          "overdose_symptoms": "Signs of accidental overdose"
        },
        "format_rules": [
          "Use medical database (Drugs.com/Medscape) as reference",
          "Flag uncertain terms with [LOW CONFIDENCE]",
          "Prioritize critical warnings first",
          "Response should be in plain text, not JSON",
          "Keep response concise (1-2 sentences)",
          "Directly answer the user's question"
        ]
      },
      "example_input": "Amoxicillin 500mg TID x7 days",
      "example_query": "Can I skip a dose?",
      "example_output": "Do not skip doses of Amoxicillin; take as prescribed even if you feel better to ensure the infection is properly treated."
    };
  } else {
    // For general context, use a simpler prompt
    prompt = `User Question: ${query}\n\nPlease provide concise, evidence-based health advice in response to this question. Keep your answer short (1-2 sentences) and focused on practical guidance.`;
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: systemRole
          },
          {
            role: 'user',
            content: JSON.stringify(prompt)
          }
        ],
        temperature: 0.2,
        max_tokens: 256 // Short response for demo
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling Groq API:', error.message);
    throw error;
  }
}

/**
 * Generate a mock response for demo purposes
 * @param {string} query - The user's question
 * @param {object|null} prescription - The user's latest prescription (if available)
 * @returns {string} - Mock response
 */
function getMockResponse(query, prescription) {
  console.log('Using mock response for:', query);
  const lowerQuery = query.toLowerCase();
  
  // If prescription context exists
  if (prescription) {
    const medication = prescription.ocrText.toLowerCase();
    
    // Medication-specific responses
    if (medication.includes('amoxicillin')) {
      if (lowerQuery.includes('skip') && lowerQuery.includes('dose')) {
        return "Do not skip doses of Amoxicillin; take as prescribed to ensure the infection is properly treated.";
      }
      if (lowerQuery.includes('food') || lowerQuery.includes('eat')) {
        return "Amoxicillin can be taken with or without food, but taking it with a meal may help reduce stomach upset.";
      }
      if (lowerQuery.includes('alcohol') || lowerQuery.includes('drink')) {
        return "It's best to avoid alcohol while taking Amoxicillin as it can increase side effects like stomach upset and make you feel more tired.";
      }
      if (lowerQuery.includes('side effect')) {
        return "Common side effects of Amoxicillin include diarrhea, stomach upset, and rash. Contact your doctor if you experience severe side effects.";
      }
    } else if (medication.includes('lisinopril')) {
      if (lowerQuery.includes('skip') && lowerQuery.includes('dose')) {
        return "If you miss a dose of Lisinopril, take it as soon as you remember. If it's almost time for your next dose, skip the missed dose and continue your regular schedule.";
      }
      if (lowerQuery.includes('food') || lowerQuery.includes('eat')) {
        return "Lisinopril can be taken with or without food. Maintain a low-sodium diet as recommended by your doctor.";
      }
      if (lowerQuery.includes('alcohol') || lowerQuery.includes('drink')) {
        return "Limit alcohol consumption while taking Lisinopril as it can enhance the blood pressure-lowering effect and cause dizziness.";
      }
      if (lowerQuery.includes('side effect')) {
        return "Common side effects of Lisinopril include dry cough, dizziness, and headache. Contact your doctor if these persist or worsen.";
      }
    }
    
    // Generic prescription-related responses
    if (lowerQuery.includes('skip') && lowerQuery.includes('dose')) {
      return "Generally, it's important not to skip doses of your medication. If you miss a dose, follow the guidance in your prescription or consult your doctor.";
    }
    if (lowerQuery.includes('side effect')) {
      return "Every medication can have side effects. Monitor how you feel and report any unusual symptoms to your healthcare provider.";
    }
  }
  
  // General health advice responses
  if (lowerQuery.includes('diabetes') && (lowerQuery.includes('diet') || lowerQuery.includes('food'))) {
    return "For diabetes management, focus on low-carb foods, plenty of vegetables, lean proteins, and whole grains. Consult a nutritionist for personalized advice.";
  }
  if (lowerQuery.includes('blood pressure') || lowerQuery.includes('hypertension')) {
    return "To manage blood pressure, reduce sodium intake, exercise regularly, maintain a healthy weight, and take medications as prescribed.";
  }
  if (lowerQuery.includes('sleep') || lowerQuery.includes('insomnia')) {
    return "For better sleep, maintain a consistent schedule, avoid screens before bed, limit caffeine, and create a comfortable sleep environment.";
  }
  if (lowerQuery.includes('stress') || lowerQuery.includes('anxiety')) {
    return "To manage stress, try deep breathing exercises, regular physical activity, adequate sleep, and mindfulness practices.";
  }
  if (lowerQuery.includes('headache') || lowerQuery.includes('migraine')) {
    return "For headaches, ensure you're hydrated, get enough rest, and consider over-the-counter pain relievers. Consult a doctor for frequent or severe headaches.";
  }
  
  // Default response
  return "I recommend consulting with your healthcare provider for personalized advice on this matter. They can provide guidance specific to your health situation.";
} 