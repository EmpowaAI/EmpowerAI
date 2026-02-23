class AuthResponseDto {
    constructor(userId, name, email, accessToken, refreshToken) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}

module.exports = AuthResponseDto;