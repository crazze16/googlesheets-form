const {google} = require('googleapis');
const keys = require('./config.json');

const client = new google.auth.JWT(keys.client_email, null, keys.private_key, [
    'https://www.googleapis.com/auth/spreadsheets',
]);

const personData = {level: 'junior', stack: 'react'};

client.authorize(async (error, tokens) => {
    if (error) {
        console.log(error);
    } else {
        const allCategories = await gsrun(client);
    }
});

async function gsrun(cl) {
    const gsapi = google.sheets({version: 'v4', auth: cl});
    const opt = {
        spreadsheetId: '1YAQf2qPezNgPUpefP6lyFFfBdm6cLLaDBHJDGSEOZcI',
        range: 'Interview questions!A:D',
    };
    const gsGeneralInfo = await gsapi.spreadsheets.values.get(opt);
    const allCells = gsGeneralInfo.data.values;

    const moduleNamesArr = [];
    const startModuleIndex = [];
    const qData = {}


    const moduleTypeArr = () => {
        for (let i = 1; i < allCells.length; i++) {
            allCells[i][0] && moduleNamesArr.push(allCells[i][0]);
            for (let j = 0; j < moduleNamesArr.length; j++) {
                allCells[i].includes(moduleNamesArr[j]) && startModuleIndex.push({[moduleNamesArr[j]]: allCells.indexOf(allCells[i])});
            }
        }
        console.log('moduleNamesArr:', moduleNamesArr)
        console.log('startModuleIndex:', startModuleIndex)
    }
    moduleTypeArr();

    const questionsByModuleName = () => {
        for (let i = 0; i < moduleNamesArr.length; i++) {
            qData[moduleNamesArr[i]] = allCells.slice(startModuleIndex[i][moduleNamesArr[i]], startModuleIndex[i !== moduleNamesArr.length - 1 ? i + 1 : moduleNamesArr.length - 1][i !== moduleNamesArr.length - 1 ? moduleNamesArr[i + 1] : allCells.length])
            for(let j = 0; j < qData[moduleNamesArr[i]].length; j++){
                qData[moduleNamesArr[i]][j].shift()
            }
        }
        console.log(qData)
    }
    questionsByModuleName()

    const filteredData = {};

    const getQuestionsByLevel = (level) => {
        const arr = []

        for(let j = 0; j < moduleNamesArr.length; j++){
            for(let i = 0; i < qData[moduleNamesArr[j]].length; i++){

                filteredData[moduleNamesArr[j]] ? filteredData[moduleNamesArr[j]].push(qData[moduleNamesArr[j]][i][level]) : filteredData[moduleNamesArr[j]] = [];
            }
        }
        console.log('filteredData:', filteredData['JS'])
        const qCountByStack = filteredData['JS'].length * 60 / 100;

        for(let i = 0; i < filteredData['JS'].length; i++){
            arr.push(i)
        }

        let randomIndex = () => Math.floor(Math.random() * arr.length)
        for(let i = 0; i < qCountByStack; i++){
            arr.splice(randomIndex(), 1);
        }
        const newArr = arr.map(i => filteredData['JS'][i])
        return { newArr }
    }

    const junLvl = getQuestionsByLevel(0)
    const midLvl = getQuestionsByLevel(1)
    // console.log('junLvl:', junLvl)
    console.log('midLvl:', midLvl)
}