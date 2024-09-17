const pass = document.querySelector('#pass');
const newPassword = document.querySelector('#newPassword');

function generatePass(){
    if(pass.value == ''){
        alert('Digite o tamanho da sua senha!');
    }

    let charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";

    for(var i = 0, n = charset.length; i < pass.value; i++){
        password += charset.charAt( Math.floor(Math.random() * n))
    }

    console.log(password);

}

