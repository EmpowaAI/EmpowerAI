const User = require('./user.Model');
const { toGetUserDTO } = require('./use.Dtos/GetUserDto');
const { toUpdateUserDTO } = require('./use.Dtos/UpdateUserDto');
const { NotFoundError } = require('../../utils/errors');

class UserService {

  async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    return toGetUserDTO(user);
  }

  async updateUser(userId, rawData) {
    const dto = toUpdateUserDTO(rawData);

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: dto },
      { new: true, runValidators: true }
    );

    if (!updated) throw new NotFoundError('User not found');

    return toGetUserDTO(updated);
  }
}

module.exports = new UserService();