
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const submit_login = document.querySelector("#submit-login");
const submit_register = document.querySelector("#submit-register");

const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

submit_login.addEventListener("click", async () => {
  const username = document.querySelector("#username").value
  const password = document.querySelector("#password").value
  const response = await fetch('http://localhost:3001/api/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({username, password})
  })
})


if(!window.localStorage){
  alert('Trình duyệt này không hỗ trợ chức năng này, vui lòng thử lại sau!\n(Hệ thống sẽ tự động đưa về trang chủ toladev)');
  window.location.href="http://localhost:3001";
}
let token = ''
token = localStorage.getItem("token-checkin-active");
console.log(`token: '${token}'`);
if(typeof(token) == undefined || token == "" || token == null) {
  //Tạo localstorage
  let now = Date.now();
  let rstr= randStr(3);
  localStorage.setItem("token-checkin-active", now+"@"+rstr);
}
document.getJON



function randStr(length) {
  let result='';
  let characters='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let charactersLength=characters.length;
  for(let i=0;i<length;i++){
    result+=characters.charAt(Math.floor(Math.random()*charactersLength));
  }
  return result;
}



