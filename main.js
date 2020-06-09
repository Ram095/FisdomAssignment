var cardList = [];
var cType='';
const parent = document.getElementById('list');

//Function called on load to fetch saved cards stored in localStorage
function getcardList(){
  
  let LocalcardList = localStorage.getItem('cardList')

  if(LocalcardList.length>0){
    cardList = JSON.parse(LocalcardList);
    for(let i=0;i<cardList.length;i++){
      createCardList(cardList[i],i)
    }
  }else{
    document.getElementById('nocards').style.display = 'flex';
  }
}

/*Function to create card
Parameters : cardList { type,cardNumber,expiryDate,cvv }, index
CVV is not displayed in the list as it is private */
function createCardList(cardList,index){
  let src='';

  src = fetchCardImage(cardList.type);
  let maskedCardNumber = cardList.cardNumber.slice(0, -4).replace(/[^\s\\]/g, 'X') + cardList.cardNumber.slice(-4);
  let newChild = `<div id=`+"cardIndex" + index +`><div class="text-right card_deleteIcon" ><a onclick=deletecard(`+index+`)><i class="glyphicon glyphicon-remove"></i></a></div>
  <div class="thumbnail">
    <div class="caption">
      <img src=`+src+` alt="..." >
      <b id=`+"cardNumber"+index+`>`+maskedCardNumber+`</b>
      <span>`+cardList.expiryDate+`</span>
    </div>
  </div></div>`;

  parent.insertAdjacentHTML('beforeend', newChild);
  document.getElementById('nocards').style.display = 'none';
}

/*Fetch Card Images based on card type
Parameter : type
Returns image source*/
function fetchCardImage(type){
  if(type=='Visa'){
    src='assets/images/visa.png'
  }else if(type=='Master Card'){
    src='assets/images/mastercard.png'
  }else if(type == 'American Express'){
    src = 'assets/images/american-express.png';
  }else if(type == 'Discover'){
    src= 'assets/images/discover.png'
  }else{
    src = 'assets/images/credit-card.png';
  }

  return src;
}

/*Function to delete card based on index
Parameter : index*/
function deletecard(index) {
  var list = document.getElementById("list");
  let cardnumber = document.getElementById('cardNumber'+index);
  list.removeChild(document.getElementById('cardIndex'+index));

  cardList.splice(cardList.findIndex(item => item.cardNumber === cardnumber),1);

  if(!cardList.length>0){
    document.getElementById('nocards').style.display = 'flex';
  }

  localStorage.setItem('cardList',JSON.stringify(cardList));
}

/*Function to validate card
Parameter cardNumber*/ 
function validateCard_format(ccid) {
 
  let cardNumberString=document.getElementById(ccid).value;
  cardNumberString=cardNumberString.replace(/[^0-9]/g, '');
 
  let typeCheck = cardNumberString.substring(0, 2);
 
  let block1='';
  let block2='';
  let block3='';
  let block4='';
  let maxlength='';
  let formatted='';

  if  (typeCheck.length==2) {
      typeCheck=parseInt(typeCheck);
      if (typeCheck >= 40 && typeCheck <= 49) {
          cType='Visa';
      }
      else if (typeCheck >= 51 && typeCheck <= 55) {
          cType='Master Card';
      }
      else if ((typeCheck >= 60 && typeCheck <= 62) || (typeCheck == 64) || (typeCheck == 65)) {
          cType='Discover';
      }else if (typeCheck==34 || typeCheck==37) {
          cType='American Express';
      }
      else {
          cType='Invalid';
      }
  }

 
  block1 = cardNumberString.substring(0, 4);
  if (block1.length==4) {
      block1=block1 + ' ';
  }

  if (cType == 'Visa' || cType == 'Master Card' || cType == 'Discover') {
      // for 4X4 cards
      block2 = cardNumberString.substring(4, 8);
      if (block2.length==4) {
          block2=block2 + ' ';
      }
      block3 = cardNumberString.substring(8, 12);
      if (block3.length==4) {
          block3=block3 + ' ';
      }
      block4 = cardNumberString.substring(12, 16);

      maxlength=19;
  }
  else if (cType == 'American Express') {
    // for Amex cards
    block2 =  cardNumberString.substring(4, 10);
    if (block2.length==6) {
        block2=block2 + ' ';
    }
    block3 =  cardNumberString.substring(10, 15);
    block4='';

    maxlength=17;
  }
  else if (cType == 'Invalid') {
      block1 =  typeCheck;
      block2='';
      block3='';
      block4='';
      alert('Invalid Card Number');
  }

  formatted=block1 + block2 + block3 + block4;
  document.getElementById(ccid).value=formatted;
  document.getElementById('cardType').src = fetchCardImage(cType);
  if (document.getElementById(ccid).value.length == maxlength && maxlength!='') {
      focusNext('expiryDate')
  }
}

//Function to Add Card on click on Add
function addCard(){
    let cardNumber = document.getElementById('cardNumber');
    if(!cardNumber.value){
      cardNumber.classList.add('error');
      alert("Please enter card number");
      return;
    }else if(cType!='American Express' & cardNumber.value.length<19){
      cardNumber.classList.add('error');
      alert("Invalid card number");
      return;
    }
    let expiryDate = document.getElementById('expiryDate');
    if(!expiryDate.value){
      expiryDate.classList.add('error');
      alert("Please enter expiry Date");
      return;
    }
    let cvv = document.getElementById('cvv');
    
    if(!cvv.value){
      cvv.classList.add('error');
      alert("Please enter CVV");
      return;
    }else if(cType!='American Express' & cvv.value.length!=3){
      cvv.classList.add('error');
      alert("Invalid CVV");
      return;
    }else if(cType=='American Express' & cvv.value.length!=4){
      cvv.classList.add('error');
      alert("Invalid CVV");
      return;
    }
   
    var process_expiryDate = expiryDate.value.split('-');
    process_expiryDate = process_expiryDate[1]+'/'+process_expiryDate[0];
    let newCard = {
      type:cType,
      cardNumber:cardNumber.value,
      cvv:cvv.value,
      expiryDate:process_expiryDate
    }
    cardList.push(newCard)
    cardNumber.value = '', expiryDate.value='',cvv.value='',cType='';
    document.getElementById('cardType').src=fetchCardImage(''); 
    document.getElementById('successMessage').style.display = 'block';
    createCardList(newCard,cardList.length-1);
    setTimeout(function(){
      document.getElementById('successMessage').style.display = 'none';
    },3000)

    if(localStorageExist()){
      localStorage.setItem('cardList',JSON.stringify(cardList));
    }else{
      alert("Local Storage Quota Exceeded.");
    }

}

//Function to remove error class from an input field on focus
function removeErrorClass(id){
  document.getElementById(id).classList.remove('error');
}

//Function to shift focus to next field
function focusNext(id){
  document.getElementById(id).focus();  
}

//Function to prevent non numeric characters in CVV field
function validateCVV_format(cvvId){
  let cvvString=document.getElementById(cvvId).value;
  document.getElementById(cvvId).value=cvvString.replace(/[^0-9]/g, '');
}

//function to check if local storage is available or not
function localStorageExist(){
    let testString = 'test';
    try {
        localStorage.setItem('test', testString);
        localStorage.removeItem('test');
        return true;
    } catch(e) {
        return false;
    }
}