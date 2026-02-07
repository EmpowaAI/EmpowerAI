module.exports = {
  levels: [
    { match: ['matric', 'grade 12', 'high school', 'nsc', 'national senior certificate'], boostSkills: ['Customer Service', 'Communication', 'Sales'] },
    { match: ['ncv', 'national certificate (vocational)'], boostSkills: ['Technical Support', 'Customer Service', 'Communication'] },
    { match: ['tvet', 'college', 'national certificate', 'nqf 3', 'nqf 4'], boostSkills: ['IT Support', 'Customer Service', 'Problem Solving'] },
    { match: ['certificate', 'short course', 'nqf 5'], boostSkills: ['Web Development', 'IT Support', 'Customer Service'] },
    { match: ['diploma', 'nqf 6'], boostSkills: ['Project Management', 'Accounting', 'Marketing'] },
    { match: ['degree', 'bachelor', 'bsc', 'ba', 'nqf 7'], boostSkills: ['Software Development', 'Data Analysis', 'Finance'] },
    { match: ['honours', 'nqf 8'], boostSkills: ['Leadership', 'Project Management', 'Data Analysis'] },
    { match: ['master', 'msc', 'mba', 'nqf 9'], boostSkills: ['Leadership', 'Strategy', 'Data Analysis'] },
    { match: ['phd', 'doctorate', 'nqf 10'], boostSkills: ['Research', 'Leadership', 'Data Analysis'] }
  ],
  weight: 10
};
