import fs from 'fs';
import path from 'path';

const historyPath = path.join('./usersaction.json');

const createUserHistory = (userID, username, name, lang, action) => {
    const historyData = JSON.parse(fs.readFileSync(historyPath));
    const userHistory = historyData.filter((history) => history.userID === userID);
    if (userHistory.length == 0) {
        const newUser = {
            userID: userID,
            username: username,
            name: name,
            lang: lang,
            action: action,
        }
        historyData.push(newUser);
        fs.writeFileSync(historyPath, JSON.stringify(historyData));
    } else {
        const userHistory = historyData.filter((history) => history.userID === userID);
        userHistory.action = action;
        userHistory.lang = lang;
        fs.writeFileSync(historyPath, JSON.stringify(userHistory));
    }
}

const updateAction = (userID, action) => {
    const historyData = JSON.parse(fs.readFileSync(historyPath));
    const userHistory = historyData.filter((history) => history.userID === userID);
    userHistory.action = action;
    fs.writeFileSync(historyPath, JSON.stringify(userHistory));
}
const newData = (userID, dataKey, dataValue) => {
    const historyData = JSON.parse(fs.readFileSync(historyPath));
    const userHistory = historyData.filter((history) => history.userID === userID)[0];
    userHistory[dataKey] = dataValue;
    fs.writeFileSync(historyPath, JSON.stringify(historyData));
}
const updAndNewData = (userID, action, dataKey, dataValue) => {
    const historyData = JSON.parse(fs.readFileSync(historyPath));
    const userHistory = historyData.filter((history) => history.userID == userID)[0]
    userHistory.action = action;
    userHistory[dataKey] = dataValue;
    fs.writeFileSync(historyPath, JSON.stringify(historyData));
}
const getUserHistory = (userID) => {
    const historyData = JSON.parse(fs.readFileSync(historyPath));
    const userHistory = historyData.filter((history) => history.userID === userID);
    return userHistory;
}
const getUserLang = (userID) => {
    const historyData = JSON.parse(fs.readFileSync(historyPath));
    const userHistory = historyData.filter((history) => history.userID == userID)[0]
    return userHistory.lang;
}
const getUserAction = (userID) => {
    const historyData = JSON.parse(fs.readFileSync(historyPath));
    const userHistory = historyData.filter((history) => history.userID == userID)[0]
    return userHistory.action;
}
const getByKey = (userID, dataKey) => {
    const historyData = JSON.parse(fs.readFileSync(historyPath));
    const userHistory = historyData.filter((history) => history.userID === userID)[0];
    return userHistory[dataKey];
}
const deleteUserHistory = (user) => {
    const historyData = JSON.parse(fs.readFileSync(historyPath));
    const userHistory = historyData.filter((history) => history.user !== user);
    fs.writeFileSync(historyPath, JSON.stringify(userHistory));
}

export { createUserHistory, getUserHistory, deleteUserHistory, updateAction, newData, updAndNewData, getByKey, getUserLang, getUserAction };