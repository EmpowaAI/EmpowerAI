

const PRODUCTS = {
  CV_ANALYSER:     'cv_analyser',
  CV_REVAMP:       'cv_revamp',
  INTERVIEW_COACH: 'interview_coach',
  ECONOMIC_TWIN:   'economic_twin',
};

const PLAN_LIMITS = {
  starter: {
    [PRODUCTS.CV_ANALYSER]:     5,
    [PRODUCTS.CV_REVAMP]:       2,
    [PRODUCTS.INTERVIEW_COACH]: 3,
    [PRODUCTS.ECONOMIC_TWIN]:   1,
  },
  professional: {
    [PRODUCTS.CV_ANALYSER]:     30,
    [PRODUCTS.CV_REVAMP]:       15,
    [PRODUCTS.INTERVIEW_COACH]: 20,
    [PRODUCTS.ECONOMIC_TWIN]:   10,
  },
  enterprise: {
    [PRODUCTS.CV_ANALYSER]:     -1,
    [PRODUCTS.CV_REVAMP]:       -1,
    [PRODUCTS.INTERVIEW_COACH]: -1,
    [PRODUCTS.ECONOMIC_TWIN]:   -1,
  },
};

const getLimit = (planId, product) => {
  return PLAN_LIMITS[planId]?.[product] ?? 0;
};

module.exports = { PRODUCTS, PLAN_LIMITS, getLimit };
