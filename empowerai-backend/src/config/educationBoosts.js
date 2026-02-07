module.exports = {
  levels: [
    { match: ['matric', 'grade 12', 'high school'], boostSkills: ['Customer Service', 'Communication', 'Sales'] },
    { match: ['certificate', 'short course'], boostSkills: ['Web Development', 'IT Support', 'Customer Service'] },
    { match: ['diploma'], boostSkills: ['Project Management', 'Accounting', 'Marketing'] },
    { match: ['degree', 'bachelor', 'bsc', 'ba'], boostSkills: ['Software Development', 'Data Analysis', 'Finance'] },
    { match: ['honours', 'master', 'msc', 'mba'], boostSkills: ['Leadership', 'Project Management', 'Data Analysis'] }
  ],
  weight: 10
};
