const UserRepository = require('./User.Repository');
const { toGetUserDTO } = require('./use.Dtos/GetUserDto');
const { toUpdateUserDTO } = require('./use.Dtos/UpdateUserDto');
const { NotFoundError } = require('../../utils/errors');

async function getUserProfile(userId) {
  const user = await UserRepository.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  return toGetUserDTO(user);
}

async function updateUser(userId, rawData) {
  const fields = toUpdateUserDTO(rawData);
  const updated = await UserRepository.updateUser(userId, fields);
  if (!updated) throw new NotFoundError('User not found');
  return toGetUserDTO(updated);
}

module.exports = { getUserProfile, updateUser };