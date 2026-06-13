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
