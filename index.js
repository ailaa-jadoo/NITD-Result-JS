const express = require('express');
const path = require('path');
const app = express();
const axios = require('axios');
const https = require('https');
const compression = require('express-compression')
const port = 3300;

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

// app.use(compression({ brotli: { enabled: true, zlib: { } } }))
app.use(compression({ 
    brotli: { enabled: true, zlib: {} },
    threshold: 0
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 
app.locals.compileDebug = false;

app.use(express.static(path.join(__dirname, 'public')))

const cache = {};

app.get('/', (req, res) => {
    res.render('enterId');
});

app.get('/profile', async (req, res) => {
    const studentRoll = req.query.rollnum;

    if (cache[studentRoll]) {
        return res.render('profile', cache[studentRoll]);
    }

    const important = {
        httpsAgent: httpsAgent,
        headers: {
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': 'JSESSIONID=-q5TugmDOh-do992E5EfjUcw.undefined',
            'Origin': 'https://erp.nitdelhi.ac.in',
            'Referer': 'https://erp.nitdelhi.ac.in/CampusLynxNITD/student/result.jsp',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-GPC': '1',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest'
        },
    }

    const id = "https://erp.nitdelhi.ac.in/CampusLynxNITD/CounsellingRequest?sid=validate&refor=StudentOnlineDetailService";
    const dataForID = `jdata={"sid":"validate","instituteID":"NITDINSD1506A0000001","studentrollno":"${studentRoll}"}`;
    const idResponse = await axios.post(id, dataForID, important);
    let studentId = idResponse.data;

    const details = "https://erp.nitdelhi.ac.in/CampusLynxNITD/CounsellingRequest?sid=2002&refor=StudentSeatingMasterService";
    const sgcg = "https://erp.nitdelhi.ac.in/CampusLynxNITD/CounsellingRequest?sid=2005&refor=StudentSeatingMasterService";
    const grades = "https://erp.nitdelhi.ac.in/CampusLynxNITD/CounsellingRequest?sid=2003&refor=StudentSeatingMasterService";

    const dataToSend1 = `jdata={"sid":"2002","mname":"ExamSgpaCgpaDetailOfStudent","studentID":"${studentId}","instituteID":"NITDINSD1506A0000001","registrationID":"NITDRETD2208A0000001"}`;
    const dataToSend2 = `jdata={"sid":"2002","mname":"ExamSgpaCgpaDetailOfStudent","studentID":"${studentId}","instituteID":"NITDINSD1506A0000001","registrationID":"NITDRETD2208A0000001"}`;

    const [detailsResponse, sgcgResponse] = await Promise.all([
        axios.post(details, dataToSend1, important),
        axios.post(sgcg, dataToSend2, important),
    ]);

    let detailsData = detailsResponse.data;
    let sgcgData = sgcgResponse.data;


    const gradesData = [];
    
    if(sgcgData.length != 0){
        try {
            const promises = Array.from({ length: sgcgData.length }, (_, stynumber) => {
                const dataToSend3 = `jdata={"sid":"2003","mname":"studentGrade","studentID":"${studentId}","instituteID":"NITDINSD1506A0000001","stynumber":${stynumber + 1}}`;
                return axios.post(grades, dataToSend3, important);
            });

            const responses = await Promise.all(promises);

            responses.forEach((gradesResponse) => {
                if (gradesResponse.data[0]) {
                    gradesData.push(gradesResponse.data);
                }
            });

        } catch (error) {
            console.error("Error:", error);
            res.status(500).send("Internal Server Error");
        }
    }


    const collapse = ["collapseOne", "collapseTwo", "collapseThree", "collapseFour", "collapseFive", "collapseSix", "collapseSeven", "collapseEight"]
    const semester = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"]


    cache[studentRoll] = { detailsData, sgcgData, gradesData, collapse, semester, studentId };

    res.render('profile', cache[studentRoll]);
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});