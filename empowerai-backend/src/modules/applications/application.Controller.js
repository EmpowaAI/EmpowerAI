const supabase = require('../../db/supabase');
const logger = require('../../utils/logger');

exports.createApplication = async (req, res, next) => {
  try {
    const { opportunityId } = req.body;
    if (!opportunityId) {
      return res.status(400).json({ status: 'error', message: 'opportunityId is required' });
    }

    const { data: opp, error: oppError } = await supabase
      .from('opportunities').select('source, application_url').eq('id', opportunityId).single();
    if (oppError || !opp) {
      return res.status(404).json({ status: 'error', message: 'Opportunity not found' });
    }

    const { data: application, error } = await supabase
      .from('applications')
      .insert({
        user_id: req.user.id,
        opportunity_id: opportunityId,
        source: opp.source || 'manual',
        application_url: opp.application_url || '',
      })
      .select()
      .single();

    if (error) {
      // PostgreSQL unique violation — already tracked
      if (error.code === '23505') {
        return res.status(200).json({ status: 'success', data: { created: false } });
      }
      throw error;
    }

    logger.info('Application tracked', { correlationId: req.correlationId, userId: req.user.id, opportunityId });

    return res.status(201).json({ status: 'success', data: { application, created: true } });
  } catch (error) {
    next(error);
  }
};

exports.getMyApplications = async (req, res, next) => {
  try {
    const { data: applications, error } = await supabase
      .from('applications')
      .select('*, opportunity:opportunities(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      status: 'success',
      results: (applications || []).length,
      data: { applications: applications || [] },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyApplicationStats = async (req, res, next) => {
  try {
    const { count, error } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.status(200).json({ status: 'success', data: { total: count || 0 } });
  } catch (error) {
    next(error);
  }
};

// ─── SAVED OPPORTUNITIES (BOOKMARKS) ─────────────────────────────────────────

exports.saveOpportunity = async (req, res, next) => {
  try {
    const { opportunityId } = req.body;
    if (!opportunityId) {
      return res.status(400).json({ status: 'error', message: 'opportunityId is required' });
    }

    const { error } = await supabase
      .from('saved_opportunities')
      .insert({ user_id: req.user.id, opportunity_id: opportunityId });

    if (error) {
      // 23505 unique violation — already saved, treat as success (idempotent)
      // 23503 FK violation — opportunity doesn't exist
      if (error.code === '23503') {
        return res.status(404).json({ status: 'error', message: 'Opportunity not found' });
      }
      if (error.code !== '23505') throw error;
    }

    return res.status(200).json({ status: 'success', data: { saved: true, opportunityId } });
  } catch (error) {
    next(error);
  }
};

exports.unsaveOpportunity = async (req, res, next) => {
  try {
    const { opportunityId } = req.params;

    const { error } = await supabase
      .from('saved_opportunities')
      .delete()
      .eq('user_id', req.user.id)
      .eq('opportunity_id', opportunityId);

    if (error) throw error;

    return res.status(200).json({ status: 'success', data: { saved: false, opportunityId } });
  } catch (error) {
    next(error);
  }
};

exports.getSavedOpportunities = async (req, res, next) => {
  try {
    const { data: saved, error } = await supabase
      .from('saved_opportunities')
      .select('opportunity_id, created_at, opportunity:opportunities(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      status: 'success',
      results: (saved || []).length,
      data: {
        savedIds: (saved || []).map((s) => s.opportunity_id),
        saved: saved || [],
      },
    });
  } catch (error) {
    next(error);
  }
};
