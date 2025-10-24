/**
 * Supabase Client Configuration
 *
 * Handles all database connections and operations for StudyBuddy AI
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials!');
  console.error('Please check your .env file has:');
  console.error('- REACT_APP_SUPABASE_URL');
  console.error('- REACT_APP_SUPABASE_ANON_KEY');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Sign up a new user
 */
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) throw error;
  return data;
};

/**
 * Sign in existing user
 */
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

// ============================================
// STUDY MATERIALS FUNCTIONS
// ============================================

/**
 * Upload PDF to Supabase Storage
 */
export const uploadPDF = async (file, userId) => {
  const fileName = `${userId}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from('study materials')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;
  return data.path;
};

/**
 * Get public URL for uploaded PDF
 */
export const getPDFUrl = (filePath) => {
  const { data } = supabase.storage
    .from('study materials')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

/**
 * Save study material metadata to database
 */
export const saveMaterial = async (materialData) => {
  const { data, error } = await supabase
    .from('study_materials')
    .insert(materialData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get all materials for current user
 */
export const getMaterials = async (userId) => {
  const { data, error } = await supabase
    .from('study_materials')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Get single material by ID
 */
export const getMaterial = async (materialId) => {
  const { data, error } = await supabase
    .from('study_materials')
    .select('*')
    .eq('id', materialId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete material (also deletes PDF from storage)
 */
export const deleteMaterial = async (materialId, filePath) => {
  // Delete from storage first
  const { error: storageError } = await supabase.storage
    .from('study materials')
    .remove([filePath]);

  if (storageError) throw storageError;

  // Delete from database (cascades to related records)
  const { error: dbError } = await supabase
    .from('study_materials')
    .delete()
    .eq('id', materialId);

  if (dbError) throw dbError;
};

// ============================================
// STUDY SESSIONS FUNCTIONS
// ============================================

/**
 * Create new study session
 */
export const createSession = async (sessionData) => {
  const { data, error } = await supabase
    .from('study_sessions')
    .insert(sessionData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * End study session
 */
export const endSession = async (sessionId, durationMinutes) => {
  const { data, error } = await supabase
    .from('study_sessions')
    .update({
      end_time: new Date().toISOString(),
      duration_minutes: durationMinutes
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get sessions for a material
 */
export const getSessions = async (materialId) => {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('material_id', materialId)
    .order('start_time', { ascending: false });

  if (error) throw error;
  return data;
};

// ============================================
// PROGRESS TRACKING FUNCTIONS
// ============================================

/**
 * Get or create progress for a material
 */
export const getProgress = async (userId, materialId) => {
  const { data, error } = await supabase
    .from('progress_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('material_id', materialId)
    .single();

  if (error && error.code === 'PGRST116') {
    // No progress exists, create new
    return createProgress(userId, materialId);
  }

  if (error) throw error;
  return data;
};

/**
 * Create initial progress record
 */
export const createProgress = async (userId, materialId) => {
  const { data, error } = await supabase
    .from('progress_tracking')
    .insert({
      user_id: userId,
      material_id: materialId,
      questions_answered: 0,
      correct_answers: 0,
      topics_studied: [],
      weak_areas: [],
      concept_mastery: {}
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update progress
 */
export const updateProgress = async (userId, materialId, updates) => {
  const { data, error } = await supabase
    .from('progress_tracking')
    .update({
      ...updates,
      last_studied: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('material_id', materialId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// CONVERSATION HISTORY FUNCTIONS
// ============================================

/**
 * Save conversation message
 */
export const saveMessage = async (messageData) => {
  const { data, error } = await supabase
    .from('conversation_history')
    .insert(messageData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get conversation history for a session
 */
export const getConversationHistory = async (sessionId) => {
  const { data, error } = await supabase
    .from('conversation_history')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Get recent conversations for a material
 */
export const getRecentConversations = async (materialId, limit = 50) => {
  const { data, error } = await supabase
    .from('conversation_history')
    .select('*')
    .eq('material_id', materialId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data.reverse(); // Return in chronological order
};

// ============================================
// EXAM CONFIGURATION FUNCTIONS
// ============================================

/**
 * Save or update exam configuration
 */
export const saveExamConfig = async (userId, materialId, config) => {
  const { data, error } = await supabase
    .from('exam_configurations')
    .upsert({
      user_id: userId,
      material_id: materialId,
      ...config
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get exam configuration for a material
 */
export const getExamConfig = async (userId, materialId) => {
  const { data, error } = await supabase
    .from('exam_configurations')
    .select('*')
    .eq('user_id', userId)
    .eq('material_id', materialId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// ============================================
// QUIZ RESULTS FUNCTIONS
// ============================================

/**
 * Save quiz result
 */
export const saveQuizResult = async (resultData) => {
  const { data, error } = await supabase
    .from('quiz_results')
    .insert(resultData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get quiz results for a material
 */
export const getQuizResults = async (materialId) => {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('material_id', materialId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Get quiz statistics
 */
export const getQuizStats = async (materialId) => {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('is_correct, topic')
    .eq('material_id', materialId);

  if (error) throw error;

  // Calculate statistics
  const total = data.length;
  const correct = data.filter(r => r.is_correct).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Topic performance
  const topicStats = {};
  data.forEach(result => {
    if (result.topic) {
      if (!topicStats[result.topic]) {
        topicStats[result.topic] = { total: 0, correct: 0 };
      }
      topicStats[result.topic].total++;
      if (result.is_correct) {
        topicStats[result.topic].correct++;
      }
    }
  });

  return {
    total,
    correct,
    accuracy,
    topicStats
  };
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if Supabase is properly configured
 */
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey &&
            supabaseUrl !== 'your-project-url' &&
            supabaseAnonKey !== 'your-anon-key');
};

/**
 * Test database connection
 */
export const testConnection = async () => {
  try {
    const { error } = await supabase
      .from('study_materials')
      .select('count')
      .limit(1);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};

export default supabase;
