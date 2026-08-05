// ===== ESTADO DA APLICAÇÃO =====
// Cada jogador é um objeto: { nome, estrelas, gols }
let jogadores = [];

// ===== PWA: REGISTRAR O SERVICE WORKER =====
// "serviceWorker in navigator" checa se o navegador do usuário suporta essa
// tecnologia, antes de tentar usar (nem todo navegador antigo suporta).
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(() => console.log('Service Worker registrado com sucesso.'))
    .catch((erro) => console.error('Erro ao registrar Service Worker:', erro));
}


// ===== REFERÊNCIAS: CADASTRO E LISTA =====
const formJogador = document.getElementById('form-jogador');
const inputNome = document.getElementById('nome-jogador');
const listaJogadores = document.getElementById('jogadores');
const contadorJogadores = document.getElementById('contador-jogadores');

// ===== REFERÊNCIAS: SORTEIO =====
const formSorteio = document.getElementById('form-sorteio');
const inputTamanhoTime = document.getElementById('tamanho-time');
const resultadoSorteio = document.getElementById('resultado-sorteio');

// ===== REFERÊNCIAS: ARTILHARIA =====
const formGol = document.getElementById('form-gol');
const selectJogadorGol = document.getElementById('select-jogador-gol');
const inputGols = document.getElementById('input-gols');
const rankingGols = document.getElementById('ranking-gols');

// ===== RENDERIZAR A LISTA PRÉVIA DE JOGADORES =====
function renderizarJogadores() {
  listaJogadores.innerHTML = '';
  contadorJogadores.textContent = `(${jogadores.length})`;

  jogadores.forEach((jogador, indice) => {
    const li = document.createElement('li');
    li.className = 'jogador-card';
    li.innerHTML = `
      <span class="jogador-numero">${indice + 1}</span>
      <span class="jogador-nome">${jogador.nome}</span>
      <span class="jogador-estrelas">${'★'.repeat(jogador.estrelas)}</span>
    `;
    listaJogadores.appendChild(li);
  });

  // Sempre que a lista de jogadores muda, o <select> da artilharia
  // também precisa ser atualizado, senão fica desatualizado.
  popularSelectGol();
}

// ===== EVENTO: CADASTRAR JOGADOR =====
formJogador.addEventListener('submit', function (evento) {
  evento.preventDefault();

  const nome = inputNome.value.trim();

  // Busca qual das 5 estrelas está marcada (input:checked).
  const estrelaMarcada = document.querySelector('input[name="estrelas"]:checked');

  // Se não digitou nome, ou não marcou nenhuma estrela, cancela o cadastro.
  if (nome === '' || !estrelaMarcada) {
    alert('Preencha o nome e escolha uma avaliação de estrelas.');
    return;
  }

  const estrelas = Number(estrelaMarcada.value);

  jogadores.push({ nome, estrelas, gols: 0 });

  formJogador.reset();
  renderizarJogadores();
});

// ===== FUNÇÃO: MONTAR OS TIMES EQUILIBRADOS (zigue-zague por estrelas) =====
function sortearTimes(tamanhoPorTime) {
  const ordenados = [...jogadores].sort((a, b) => b.estrelas - a.estrelas);

  const numTimes = Math.ceil(ordenados.length / tamanhoPorTime);
  const resto = ordenados.length % tamanhoPorTime;

  const capacidades = [];
  for (let i = 0; i < numTimes; i++) {
    const ehUltimoTime = i === numTimes - 1;
    capacidades.push(ehUltimoTime && resto !== 0 ? resto : tamanhoPorTime);
  }

  const times = [];
  for (let i = 0; i < numTimes; i++) times.push([]);

  let indiceTime = 0;
  let direcao = 1;

  ordenados.forEach((jogador) => {
    while (times[indiceTime].length >= capacidades[indiceTime]) {
      indiceTime += direcao;
      if (indiceTime === numTimes) { indiceTime = numTimes - 1; direcao = -1; }
      if (indiceTime === -1) { indiceTime = 0; direcao = 1; }
    }

    times[indiceTime].push(jogador);

    indiceTime += direcao;
    if (indiceTime === numTimes) { indiceTime = numTimes - 1; direcao = -1; }
    if (indiceTime === -1) { indiceTime = 0; direcao = 1; }
  });

  return times;
}

// ===== EVENTO: SORTEAR TIMES =====
formSorteio.addEventListener('submit', function (evento) {
  evento.preventDefault();

  const tamanhoPorTime = Number(inputTamanhoTime.value);

  if (jogadores.length < 2) {
    resultadoSorteio.innerHTML = '<p>Cadastre pelo menos 2 jogadores antes de sortear.</p>';
    return;
  }

  const times = sortearTimes(tamanhoPorTime);
  resultadoSorteio.innerHTML = '';

  times.forEach((time, indice) => {
    const divTime = document.createElement('div');
    divTime.className = 'time-sorteado';

    const totalEstrelas = time.reduce((soma, jogador) => soma + jogador.estrelas, 0);

    divTime.innerHTML = `
      <h3>Time ${indice + 1} <span class="time-forca">(${totalEstrelas} ★ no total)</span></h3>
      <ul>
        ${time.map(jogador => `<li>${jogador.nome} ${'★'.repeat(jogador.estrelas)}</li>`).join('')}
      </ul>
    `;

    resultadoSorteio.appendChild(divTime);
  });
});

// ===== ARTILHARIA: POPULAR O <select> COM OS JOGADORES CADASTRADOS =====
function popularSelectGol() {
  // O "value" de cada opção é o ÍNDICE do jogador no array (não o nome),
  // pra funcionar corretamente mesmo se dois jogadores tiverem nomes iguais.
  selectJogadorGol.innerHTML = jogadores
    .map((jogador, indice) => `<option value="${indice}">${jogador.nome}</option>`)
    .join('');
}

// ===== EVENTO: ADICIONAR GOLS =====
formGol.addEventListener('submit', function (evento) {
  evento.preventDefault();

  const indice = Number(selectJogadorGol.value);
  const gols = Number(inputGols.value);

  // Se o índice não corresponder a nenhum jogador válido, cancela.
  if (Number.isNaN(indice) || !jogadores[indice]) return;

  jogadores[indice].gols += gols;

  formGol.reset();
  renderizarRanking();
});

// ===== RENDERIZAR O RANKING DE ARTILHEIROS =====
function renderizarRanking() {
  rankingGols.innerHTML = '';

  // Só mostra quem já fez pelo menos 1 gol, ordenado do maior artilheiro pro menor.
  const artilheiros = jogadores
    .filter(jogador => jogador.gols > 0)
    .sort((a, b) => b.gols - a.gols);

  artilheiros.forEach((jogador, indice) => {
    const li = document.createElement('li');
    li.className = 'ranking-item';
    li.innerHTML = `
      <span class="ranking-pos">${indice + 1}º</span>
      <span class="ranking-nome">${jogador.nome}</span>
      <span class="ranking-gols">${jogador.gols} gol${jogador.gols > 1 ? 's' : ''}</span>
    `;
    rankingGols.appendChild(li);
  });
}
