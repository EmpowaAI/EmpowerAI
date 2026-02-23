class GetUserDto {
  constructor({ _id, name, email, age, province, education, skills, interests, isVerified, createdAt, updatedAt }) {
    this.userId = _id;
    this.name = name;
    this.email = email;
    this.age = age;
    this.province = province;
    this.education = education;
    this.skills = skills || [];
    this.interests = interests || [];
    this.isVerified = isVerified;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = GetUserDto;