class EditUserDto {
  constructor(name, age, province, education, skills, interests) {
    this.name = name;
    this.age = age;
    this.province = province;
    this.education = education;
    this.skills = skills || [];
    this.interests = interests || [];
  }
}

module.exports = EditUserDto;