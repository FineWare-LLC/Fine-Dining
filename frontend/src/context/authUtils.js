export function saveLoginInfo(token, userData) {
    const basicUserInfo = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
    };
    localStorage.setItem('authToken', token);
    localStorage.setItem('userInfo', JSON.stringify(basicUserInfo));
    return basicUserInfo;
}
