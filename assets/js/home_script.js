//Cocando o elemento com a class="content" dentro da variavel content
//Colocando o input com o tipo search dentro da variavel inputSearch;
const content = document.querySelector('.content');
const inputSearch = document.querySelector("input[type='search']");

//Declarando variavel items com um array vazio que vai alocar os objetos puxados do banco de dados;
//Declarando a variavel produtos que vai ser onde vou armazenar o produto clicado;
let items = [];
let produto = {};

//Função que filtra conforme vai digitando no input;
function filtraProdutos(){
    content.innerHTML = "";

  items.filter((item) =>
      item.nome.toLowerCase().includes(inputSearch.value.toLowerCase())
    )
    .forEach((item) => addHTML(item));

};


//Muda display da div content para exibir os produtos dentro dela;
function colocaProdutos(){
    content.style.display = 'flex' ;
}

//Muda display da div content para esconder os produtos dentro dela;
function tiraProdutos(){
    setTimeout(() => {
        content.style.display = 'none' ;
    }, 100);
}

//Função que cria um elemento div e dentro coloca o nome do produto, após isso adiciona uma classe à div;
function addHTML(item) {
    const div = document.createElement("div");
    div.innerHTML = item.nome;
    div.classList.add("produto"); // Adiciona a classe produto à div
    content.append(div); // O appen é para adicionar a div criada dentro da div 'content';


    const handleInteraction = () => {
        produto = item;
        console.log('Produto: ' + item.nome);
        insertIformacoesProduto(produto);
        openModal();
    };

    
    // Adiciona eventos de clique e toque
    div.addEventListener('click', handleInteraction);
    div.addEventListener('touchstart', handleInteraction);
}


// Exemplo de valores que serão buscados no DB;
function valores() {
    let produtos = [
        { id: 1, nome: 'Casquinha', preco: 25, quantidade: 1, precoTotal: 25},
        { id: 2, nome: 'Cascão', preco: 30, quantidade: 1, precoTotal: 30},
        { id: 3, nome: 'Paleta', preco: 27, quantidade: 1, precoTotal: 27},
        { id: 4, nome: 'Picolé', preco: 28, quantidade: 1, precoTotal: 28}
    ];

    /*Percorre o array de objetos colocando cada elemento dentro de 'produto, chama a 
    função para add no html e adiciona no final do array 'items';*/
    produtos.forEach(produto => {
        addHTML(produto);
        items.push(produto);
    });

}

//Chamando a função valores;
valores()


console.log('Esta conectado')

//Abri a tela(modal) que mostra as informações do produto selecionado, e adiciona a classe open que exibe a tela
function openModal(){
    const modal = document.getElementById('janela_modal')
    modal.classList.add('open');
}

//Fecha a tela(modal) e remove a classe;
function closeModal(){
    const modal = document.getElementById('janela_modal');
    modal.classList.remove('open')

    produto.quantidade = 1;
    produto.precoTotal = produto.preco;

    document.getElementById('quantidadeProduto').value = produto.quantidade;
}



//Função que formata para o real brasileiro, por exemplo: R$ 10,00
function formatarValorParaReal(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

//Função que inseri as informações do produto selecionado para atualização da quantidade
function insertIformacoesProduto(item){
    const nome = document.querySelector('.div_nomeProduto');
    const valor = document.querySelector('.div_valorProduto');
    
    let valorFormatado = formatarValorParaReal(item.preco);
    
     // Limpa o conteúdo anterior
     nome.innerHTML = '';
     valor.innerHTML = '';
     
    // Adiciona conteúdo
    nome.append(item.nome)
    valor.append(valorFormatado)

    atualizaPrecoTotal();
}


//Função que aumenta a quantidade ao clicar no "+";
function aumentaQuantidadeProduto(){
    produto.quantidade++;  
    document.getElementById('quantidadeProduto').value = produto.quantidade;

    atualizaPrecoTotal()

    return;
}

//Função que diminui quantidade ao clicar no "-";
function diminuiQuantidadeProduto(){
    if(produto.quantidade > 1){
        produto.quantidade--; 
        document.getElementById('quantidadeProduto').value = produto.quantidade;

        atualizaPrecoTotal()

    }else{
        return;
    }
}


//Função que coloca o valor digitado do input dentro da quantidade do produto selecionado;
function digitarQuantidadeProduto(){
    produto.quantidade = document.getElementById('quantidadeProduto').value;
}

//Função que atualiza o preço total do produto selecionado conforme for aumentando a quantidade;
function atualizaPrecoTotal(){
    const valorTotal = document.querySelector('.div_precoTotal');

    //Se caso o usuário digitar algum número menor ou igual a zero ele automaticamente corrige o valor do input para 1;
    if(document.getElementById('quantidadeProduto').value <= 0){
        console.log('É menor que 0')
        produto.quantidade = 1;
        document.getElementById('quantidadeProduto').value = 1;
    }

    produto.precoTotal = produto.quantidade * produto.preco;

    const precoTotalFormatado = formatarValorParaReal(produto.precoTotal)

    valorTotal.innerHTML = '';

    valorTotal.append(precoTotalFormatado)
}


//Declarando variavel que amarzenara os produtos selecionados para colocar na tabela;
let itemsSelecionados = [];

//Função que adiciona os items selecionados na tabela;
function adicionaItemsSelecionados(){

    const produtoSelecionado = { ...produto };

    itemsSelecionados.push(produtoSelecionado)

    const tabela = document.querySelector('table');
    
    // Cria uma nova linha (tr)
    const novaLinha = document.createElement('tr');
    

    const precoFormatado = formatarValorParaReal(produto.preco);
    const precoTotalFormatado = formatarValorParaReal(produto.precoTotal);

    // Adiciona células (td) na linha com os valores desejados
    itemsSelecionados.forEach(produto => {
        novaLinha.innerHTML = `
        <td>${produto.id}</td>
        <td>${produto.nome}</td>
        <td>${produto.quantidade}</td>
        <td>${precoFormatado}</td>
        <td>${precoTotalFormatado}</td>
    `});


    calculaSubTotal();

     // Adiciona a nova linha à tabela
     tabela.append(novaLinha);

     closeModal()
}


let somaTotalProdutos = 0;

//Função que calcula o subtotal somando o precoTotal de todos os items dentro do array de 'itemsSelecionados";
function calculaSubTotal(){
    const subTotal = document.querySelector('.div_subTotal')

    somaTotalProdutos = 0;

    itemsSelecionados.forEach(item => {
        somaTotalProdutos += item.precoTotal;
    })

    let subTotalFormatado = formatarValorParaReal(somaTotalProdutos);

    subTotal.innerHTML = `<h2>Subtotal: ${subTotalFormatado}</h2>` 
}


//Função que será o array "ItemsSelecionados" e adiciona os campos dos titulos denovo;
function cancelarOperacao(){
    itemsSelecionados.length = 0;

    const tabela = document.querySelector('table');

    tabela.innerHTML = `
    <tr>
        <th>Item</th>
        <th>Produto</th>
        <th>Quantidade</th>
        <th>Valor Unitário</th>
        <th>Total</th>
    </tr>
    `

    const subTotal = document.querySelector('.div_subTotal')

    subTotal.innerHTML = '';

    console.log('Operação Cancelada')
}

// function openPagamento(){
//     const div_pagamento = document.querySelector('.div_pagamento');

//     div_pagamento.style.display = 'flex';
// }

//Função que adiciona os items na parte do pagamento.
function addItemsPagamento(){

    const produtoPagar = document.querySelector('.produtos_a_Pagar')

    produtoPagar.innerHTML = '';

    itemsSelecionados.forEach((item,index) => {
        const div = document.createElement("div");
        const precoTotal = formatarValorParaReal(item.precoTotal)
        

        div.innerHTML = `
        <span>${index + 1}</span>
        <span>${item.nome}</span>
        <span>${precoTotal}</span>
        `

        //Adiciona a classe .pagamento_itemsSelecionados na div criada.
        div.classList.add('pagamento_itemsSelecionados');

        //Adiciona dentro da div .produtos_a_Pagar
        produtoPagar.append(div);

    })

    if(itemsSelecionados == ''){
        return;
    }else{
        document.getElementById('quantidadePessoa').value = 1;
        //Chama as funções que calcula o total por pessoa, e a função que mostra o total da compra.
        calculaTotalPessoa();
        insertDetalhesPagamento();
        calculaPagoAndFalta();
        openAndCloseModalPagamento();
        
    }

}

//Função que toda vez que for chamada abre e fecha a janela de pagamento.
function openAndCloseModalPagamento(){
    const modal_pagamento = document.querySelector(".janela_modal_pagamento")

    if(modal_pagamento.style.display === "none" || modal_pagamento.style.display === ""){
        modal_pagamento.style.display = "flex";
    }else{
        modal_pagamento.style.display = "none";
    }
}


//Função que calcula o total por pessoa.
function calculaTotalPessoa(){
    let quantidadePessoa = document.getElementById('quantidadePessoa').value;
    const div_totalPorPessoa = document.querySelector('.div_totalPorPessoa');

    if(quantidadePessoa < 1 || quantidadePessoa == ''){
        document.getElementById('quantidadePessoa').value = 1;
        quantidadePessoa = 1;
    }

    console.log(quantidadePessoa)

    const valorPorPessoa = somaTotalProdutos/quantidadePessoa;
    const valorPorPessoaFormatado = formatarValorParaReal(valorPorPessoa);

    div_totalPorPessoa.innerHTML = `
    <span>Total por pessoa: </span>
    <span>${valorPorPessoaFormatado}</span>
    `
}

//Função que inseri o subTotal dentro da .div_pagamentoSubtotal.
function insertDetalhesPagamento(){
    const div_pagamentoSubtotal = document.querySelector('.div_pagamentoSubtotal');

    const precoFormatado = formatarValorParaReal(somaTotalProdutos);

    div_pagamentoSubtotal.innerHTML = `
    <span>SubTotal</span>
    <span>${precoFormatado}</span>
    `
}

//Array que vai ser armazenado os métodos de pagamentos selecionados;
let metodosPagamentos = [];

//Função que adiciona o método de pagamento dentro do array e mostra na tela;
function addMetodosPagamentos(){
    const div_criaScrool = document.querySelector('.div_criaScrool');

    div_criaScrool.innerHTML = '';

    metodosPagamentos.forEach((item, index) => {
        const div = document.createElement("div");
        div.classList.add("metodoEscolhido");

        const div_IdMetodo = document.createElement("div");
        div_IdMetodo.innerHTML = `${index + 1} ${item.nome}`;
        div_IdMetodo.classList.add("div_IdMetodo")
        div.append(div_IdMetodo);

        const div_precoIcone = document.createElement("div");
        div_precoIcone.classList.add("div_precoIcone");

        const valorItemFormatado = formatarValorParaReal(item.valor)
        // Adiciona o preço
        const preco = document.createElement("span");
        preco.innerHTML = valorItemFormatado;
        div_precoIcone.append(preco);

        //Adiciona o icone de lixo
        const iconeLixo = document.createElement("img");
        iconeLixo.src = '../assets/img/image_lixo.png'; // Adicione o caminho correto da sua imagem
        iconeLixo.alt = 'Excluir'; // Texto alternativo para acessibilidade
        iconeLixo.classList.add('iconeLixo'); // Classe para estilizar a imagem

        //Adiciona o icone de lixo dentro da div_precoIcone
        div_precoIcone.append(iconeLixo);

        //Adiciona a div_precoIcone que está o preço e o icone de lixo dentro da div criada para cada método escolhido
        div.append(div_precoIcone);

        //Foi necessario a criação de uma div para controle do srool;
        div_criaScrool.append(div);

        //Adiciona o evento de clique, ao clicar ele vai excluir o metodo selecionado;
        iconeLixo.onclick = () => {

            metodosPagamentos.splice(index, 1);

            console.log('Método removido: ' + item.nome);
            console.log(metodosPagamentos);

            addMetodosPagamentos();
            calculaPagoAndFalta()
        }
    })
}


function openAndCloseModalMetodoPagamento(){
    const modal_metodoPagamento = document.querySelector('.janela_modal_metodosPagamento');
    
    if(modal_metodoPagamento.style.display === "none" || modal_metodoPagamento.style.display === "" ){
        modal_metodoPagamento.style.display = "flex";
    }else{
        modal_metodoPagamento.style.display = "none";
    }
}



function insertMetodoDinheiro(){
    const dinheiro = {id: 1, nome: 'Dinheiro', valor: 10};

    escolherValorMetodo(dinheiro)
    openAndCloseModalMetodoPagamento()
    
}

function insertMetodoCredito(){
    const credito = {id: 2, nome: 'Cartão de Crédito', valor: 10};
    
    escolherValorMetodo(credito)
    openAndCloseModalMetodoPagamento()
    

}

function insertMetodoDebito(){
    const debito = {id: 3, nome: 'Cartão de Débito', valor: 10};
   
    escolherValorMetodo(debito)
    openAndCloseModalMetodoPagamento()
    
}

function insertMetodoPix(){
    const pix = {id: 4, nome: 'Pix', valor: 10};
    
    escolherValorMetodo(pix)
    openAndCloseModalMetodoPagamento()
    
}

function insertMetodoValeRefeicao(){
    const valeRefeicao = {id: 5, nome: 'Vale Refeição', valor: 10};
    
    escolherValorMetodo(valeRefeicao)
    openAndCloseModalMetodoPagamento()
    
}

function insertMetodoValeAlimentacao(){
    const valeAlimentacao = {id: 6, nome: 'Vale Alimentação', valor: 10};
    
    escolherValorMetodo(valeAlimentacao)
    openAndCloseModalMetodoPagamento()
    
}



function escolherValorMetodo(metodo){
    const div_metodoEscolhido = document.querySelector('.div_nomeMetodoEscolhido');
    const valorDigitadoMetodo = document.getElementById('valorDigitadoMetodo');

    valorDigitadoMetodo.value = '';

    div_metodoEscolhido.innerHTML = `
    <span>${metodo.nome}</span>
    `
    valorDigitadoMetodo.onblur = () => {
        if(valorDigitadoMetodo.value < 0 || valorDigitadoMetodo.value === ''){
            valorDigitadoMetodo.value = 0;
        }else{
            metodo.valor = valorDigitadoMetodo.value;
            metodosPagamentos.push(metodo);

            console.log(metodo);
            console.log(metodosPagamentos)
        }
    }
}

function calculaPagoAndFalta(){
    const div_faltaPago = document.querySelector('.div_faltaPago');

    let pago = 0;

    metodosPagamentos.forEach(item => {
        item.valor = parseFloat(item.valor)
        pago += item.valor;
    })

    let falta = somaTotalProdutos - pago;

    falta = formatarValorParaReal(falta);

    pago = formatarValorParaReal(pago);



    div_faltaPago.innerHTML = `
    <span>Falta: ${falta}</span>
    <span>Pago: ${pago}</span>
    `
}

function concluirOperacaoMetodoPagamento(){
    const valorDigitadoMetodo = document.getElementById('valorDigitadoMetodo');

    addMetodosPagamentos();
    openAndCloseModalMetodoPagamento();

    if(valorDigitadoMetodo.value == ''){
        valorDigitadoMetodo.value = 0;
    }

    calculaPagoAndFalta()
}


function voltarProcesso(){
    openAndCloseModalPagamento();

    metodosPagamentos = [];
}










