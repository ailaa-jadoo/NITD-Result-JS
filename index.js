const express = require('express');
const path = require('path');
const app = express();
const axios = require('axios');
const https = require('https');
const port = 3000;

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 

app.use(express.static(path.join(__dirname, 'public')))



app.get('/', (req, res) => {
    res.render('enterId');
});

app.get('/profile', async (req, res) => {
    const studentId = req.query.student_id;
    // const studentId = 'NITDSTUT2012A0000071';
    
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
    
    const details = "https://erp.nitdelhi.ac.in/CampusLynxNITD/CounsellingRequest?sid=2002&refor=StudentSeatingMasterService";
    const sgcg = "https://erp.nitdelhi.ac.in/CampusLynxNITD/CounsellingRequest?sid=2005&refor=StudentSeatingMasterService";
    const grades = "https://erp.nitdelhi.ac.in/CampusLynxNITD/CounsellingRequest?sid=2003&refor=StudentSeatingMasterService";

    const dataToSend1 = `jdata={"sid":"2002","mname":"ExamSgpaCgpaDetailOfStudent","studentID":"${studentId}","instituteID":"NITDINSD1506A0000001","registrationID":"NITDRETD2208A0000001"}`;
    const dataToSend2 = `jdata={"sid":"2002","mname":"ExamSgpaCgpaDetailOfStudent","studentID":"${studentId}","instituteID":"NITDINSD1506A0000001","registrationID":"NITDRETD2208A0000001"}`;
    const detailsResponse  = await axios.post(details, dataToSend1, important);

    const sgcgResponse  = await axios.post(sgcg, dataToSend2, important);

    const gradesData = [];
    for (let stynumber = 1; stynumber <= 8; stynumber++) {
        const dataToSend3 = `jdata={"sid":"2003","mname":"studentGrade","studentID":"${studentId}","instituteID":"NITDINSD1506A0000001","stynumber":${stynumber}}`;
        const gradesResponse = await axios.post(grades, dataToSend3, important);


        if (!gradesResponse.data[0]) {
            break;
        }

        gradesData.push(gradesResponse.data);
    }

    const collapse = ["collapseOne", "collapseTwo", "collapseThree", "collapseFour", "collapseFive", "collapseSix", "collapseSeven", "collapseEight"]
    const semester = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"]

    let detailsData = detailsResponse.data;
    let sgcgData = sgcgResponse.data;
    res.render('profile', { detailsData, sgcgData, gradesData, collapse, semester});
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
