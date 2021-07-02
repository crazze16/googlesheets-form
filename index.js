const {google} = require('googleapis');
const keys = require('./config.json');

const client = new google.auth.JWT(keys.client_email, null, keys.private_key, [
    'https://www.googleapis.com/auth/spreadsheets',
]);


const personData = {
    stack: 'JS',
    percents: {
        junior: [60, 20, 20],
        middle: [30, 40, 30],
        senior: [20, 20, 60]
    }
};

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
    }
    moduleTypeArr();

    const questionsByModuleName = () => {
        for (let i = 0; i < moduleNamesArr.length; i++) {
            qData[moduleNamesArr[i]] = allCells.slice(startModuleIndex[i][moduleNamesArr[i]], startModuleIndex[i !== moduleNamesArr.length - 1 ? i + 1 : moduleNamesArr.length - 1][i !== moduleNamesArr.length - 1 ? moduleNamesArr[i + 1] : allCells.length])
            for(let j = 0; j < qData[moduleNamesArr[i]].length; j++){
                qData[moduleNamesArr[i]][j].shift()
            }
        }
        console.log('qData:', qData)
    }
    questionsByModuleName()


    const getQuestionsByLevel = (level, stack, percent) => {
        const filteredData = {};
        const randomElementsIndexArr = [];

        for(let j = 0; j < moduleNamesArr.length; j++){
            for(let i = 0; i < qData[moduleNamesArr[j]].length; i++){
                filteredData[moduleNamesArr[j]] ? filteredData[moduleNamesArr[j]].push(qData[moduleNamesArr[j]][i][level]) : filteredData[moduleNamesArr[j]] = [qData[moduleNamesArr[j]][i][level]];
            }
        }
        // console.log('all questions by stack level:', filteredData)

        let currentData = filteredData[stack];
        if(stack === 'React Native') currentData = [...filteredData[stack], ...filteredData['React']]


        const qCountByStack = Math.floor(currentData.length * percent / 100);

        currentData.forEach((_, i) => randomElementsIndexArr.push(i))

        let randomIndex = () => Math.random() * randomElementsIndexArr.length

        for(let i = 0; i < currentData.length - qCountByStack; i++){
            randomElementsIndexArr.splice(randomIndex(), 1);
        }

        while(randomElementsIndexArr.length < 3){
            const additionalIndex = Math.round(Math.random() * currentData.length)
            randomElementsIndexArr.push(additionalIndex)
            randomElementsIndexArr.reduce((unique, item) => unique.includes(item) ? unique : [...unique, item], [])
        }

        return randomElementsIndexArr.map(i => currentData[i])
    }

    const getAllQuestionsByStackLvl = (personData) => [0,1,2].reduce((acc, i) => [...acc, ...getQuestionsByLevel(i, personData.stack, personData.percents.junior[i])], [])

    console.log(getAllQuestionsByStackLvl(personData))
}