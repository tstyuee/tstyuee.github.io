function call(){
    let api = document.getElementById("apiKeyInput").value;
    let uid = document.getElementById("userIdInput").value;
    if(api==''){
        console.log(uid);
        alert('Please insert api key');
        
    } else{
        fetchApi(api,uid);
    }
};

function fetchApi(api,uid){
    const url = `https://api.torn.com/user/${uid}?selections=log&cat=138&key=${api}`;
    const propertyId = 2600552;
    
    
    fetch(url)
    .then((response) => response.json())
    .then((jsonResponse) => {
        //console.log(jsonResponse);
        const timeStamp = getTimestamp(jsonResponse,propertyId);      
        const TCT = convertTCT(timeStamp);
        const ourTime = convertOurTime(timeStamp);
        const myFinalAmount = calculateFinalAmount(jsonResponse,propertyId);
        const totalBalance = totalAmount(jsonResponse,propertyId);
        const penguinBalance = totalBalance - myFinalAmount;
        const row1 = [TCT, ourTime, 'Pam', myFinalAmount.toLocaleString()];
        const row2 = [TCT, ourTime, 'Penguin', penguinBalance.toLocaleString()];
        const tableBody = document.getElementById('myTableBody');

        const r1 = document.createElement('tr');
        row1.forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value;
            r1.appendChild(cell);
        });
        tableBody.appendChild(r1);

        const r2 = document.createElement('tr');
        row2.forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value;
            r2.appendChild(cell);
        });
        tableBody.appendChild(r2);


       
        


    }); 
};

function calculateFinalAmount(fetchResult, propertyId) {
    const sortedLogs = Object.values(fetchResult.log)
    .filter(entry => entry.data && entry.data.property_id === propertyId)
    .sort((a, b) => a.timestamp - b.timestamp);

    let finalAmount = 0;

    sortedLogs.forEach(entry => {
        const depositedValue = entry.data.deposited || 0;
        const withdrawnValue = entry.data.withdrawn || 0;
        finalAmount += depositedValue - withdrawnValue;
    });

    return finalAmount;
};

function getTimestamp(fetchResult, propertyId) {
    const timestamps = Object.values(fetchResult.log)
    .filter(entry => entry.timestamp && entry.data.property_id === propertyId)
    .map(entry => entry.timestamp);

    const latestTimestamps = Math.max(...timestamps);

    return latestTimestamps;
};

function convertTCT(timestamp) {
    const TCT = timestamp;
    const date = new Date(TCT * 1000);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Months are zero-based, so add 1
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const formattedTCT = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formattedTCT;
};

function convertOurTime(timestamp) {
    const ourTime = timestamp + 8 * 60 * 60;
    const date = new Date(ourTime * 1000);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Months are zero-based, so add 1
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const formattedOurTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formattedOurTime;
};

function totalAmount(fetchResult, propertyId) {
    const latestTimestamp = Math.max(...Object.values(fetchResult.log)
    .map(entry => entry.timestamp));

    const latestEntry = Object.values(fetchResult.log)
    .find(entry => entry.timestamp === latestTimestamp && entry.data.property_id === propertyId);

    const tot = latestEntry.data.balance;

    return tot;
};
