const listaProcessi = []; // Array che conterrà i processi

function generaNumeroCasuale(massimo) {
  return Math.floor(Math.random() * massimo);
}

function creaProcessi() {
  const numeroProcessi = Number(document.getElementById("num-processi").value);
  const durataMassima = Number(document.getElementById("durata-massima").value);
  const arrivoMassimo = Number(document.getElementById("arrivo-massimo").value);
  const prioritaMassima = Number(document.getElementById("priorita-massima").value);

  listaProcessi.length = 0; // Svuota l'array dei processi

  // Aggiunge il primo processo con arrivo 0
  listaProcessi.push({
    nome: "P1",
    arrivo: 0,
    durata: generaNumeroCasuale(durataMassima) + 1,
    priorita: generaNumeroCasuale(prioritaMassima) + 1
  });

  // Aggiunge gli altri processi
  for (let i = 1; i < numeroProcessi; i++) {
    listaProcessi.push({
      nome: "P" + (i + 1),
      arrivo: generaNumeroCasuale(arrivoMassimo + 1),
      durata: generaNumeroCasuale(durataMassima) + 1,
      priorita: generaNumeroCasuale(prioritaMassima) + 1
    });
  }

  // Ordina i processi per tempo di arrivo
  listaProcessi.sort((a, b) => a.arrivo - b.arrivo);

  aggiornaTabellaProcessi();
}

function aggiornaTabellaProcessi() {
  const corpoTabella = document.querySelector("#coda tbody");
  corpoTabella.innerHTML = "";

  for (let processo of listaProcessi) {
    const riga = document.createElement("tr");

    const cellaNome = document.createElement("td");
    cellaNome.innerHTML = `<strong>${processo.nome}</strong>`;
    riga.appendChild(cellaNome);

    const cellaArrivo = document.createElement("td");
    cellaArrivo.textContent = processo.arrivo;
    riga.appendChild(cellaArrivo);

    const cellaDurata = document.createElement("td");
    cellaDurata.textContent = processo.durata;
    riga.appendChild(cellaDurata);

    const cellaPriorita = document.createElement("td");
    cellaPriorita.textContent = processo.priorita;
    riga.appendChild(cellaPriorita);

    corpoTabella.appendChild(riga);
  }
}

document.getElementById("avvia-simulazione").addEventListener("click", () => {
  avviaSimulazione();
});

function avviaSimulazione() {
  const algoritmoScelto = document.getElementById("algoritmo").value;
  const quantoDiTempo = Number(document.getElementById("quanto").value);
  const velocitaClock = Number(document.getElementById("clock").value);

  if (algoritmoScelto === "Round Robin") {
    simulaRoundRobin(quantoDiTempo, velocitaClock);
  } else if (algoritmoScelto === "Priorità") {
    simulaPriorita(velocitaClock);
  }
}

function simulaPriorita(velocitaClock) {
  const processiInEsecuzione = listaProcessi.map(p => ({
    ...p,
    tempoRimanente: p.durata,
    completato: false,
    esecuzioni: []
  }));

  let tempoAttuale = 0;

  const diagramma = document.querySelector("#diagramma tbody");
  diagramma.innerHTML = "";

  const intervallo = setInterval(() => {
    let processoSelezionato = null;
    let prioritaMinima = Infinity;

    for (const processo of processiInEsecuzione) {
      if (!processo.completato &&
        processo.arrivo <= tempoAttuale &&
        processo.tempoRimanente > 0 &&
        processo.priorita < prioritaMinima) {
        processoSelezionato = processo;
        prioritaMinima = processo.priorita;
      }
    }

    if (processoSelezionato) {
      processoSelezionato.tempoRimanente--;
      processoSelezionato.esecuzioni.push(tempoAttuale);

      if (processoSelezionato.tempoRimanente === 0) {
        processoSelezionato.completato = true;
        processoSelezionato.tempoCompletamento = tempoAttuale + 1;
        processoSelezionato.turnAroundTime = processoSelezionato.tempoCompletamento - processoSelezionato.arrivo;
        processoSelezionato.tempoAttesa = processoSelezionato.turnAroundTime - processoSelezionato.durata;
      }

      aggiornaVisualizzazione(processiInEsecuzione, tempoAttuale);
    }

    tempoAttuale++;

    if (processiInEsecuzione.every(p => p.completato)) {
      aggiornaVisualizzazione(processiInEsecuzione, tempoAttuale);
      clearInterval(intervallo);
      mostraRisultatiFinali(processiInEsecuzione);
    }
  }, velocitaClock);
}

function simulaRoundRobin(quantoDiTempo, velocitaClock) {
  const processiInEsecuzione = listaProcessi.map(p => ({
    ...p,
    tempoRimanente: p.durata,
    completato: false,
    quantumUsato: 0,
    esecuzioni: []
  }));
  let tempoAttuale = 0;
  let indiceProcessoCorrente = 0;

  const diagramma = document.querySelector("#diagramma tbody");
  diagramma.innerHTML = "";

  const intervallo = setInterval(() => {
    let processoTrovato = false;
    let contatore = 0;

    while (!processoTrovato && contatore < processiInEsecuzione.length) {
      const processo = processiInEsecuzione[indiceProcessoCorrente];

      if (!processo.completato && processo.arrivo <= tempoAttuale && processo.tempoRimanente > 0) {
        processoTrovato = true;
        processo.quantumUsato++;
        processo.tempoRimanente--;
        processo.esecuzioni.push(tempoAttuale);

        aggiornaVisualizzazione(processiInEsecuzione, tempoAttuale, indiceProcessoCorrente);

        if (processo.tempoRimanente === 0) {
          processo.completato = true;
          processo.tempoCompletamento = tempoAttuale + 1;
          processo.turnAroundTime = processo.tempoCompletamento - processo.arrivo;
          processo.tempoAttesa = processo.turnAroundTime - processo.durata;
          processo.quantumUsato = 0;
        } else if (processo.quantumUsato >= quantoDiTempo) {
          processo.quantumUsato = 0;
          indiceProcessoCorrente = (indiceProcessoCorrente + 1) % processiInEsecuzione.length;
        }
      } else {
        indiceProcessoCorrente = (indiceProcessoCorrente + 1) % processiInEsecuzione.length;
      }
      contatore++;
    }

    tempoAttuale++;

    if (processiInEsecuzione.every(p => p.completato)) {
      aggiornaVisualizzazione(processiInEsecuzione, tempoAttuale);
      clearInterval(intervallo);
      mostraRisultatiFinali(processiInEsecuzione);
    }
  }, velocitaClock);
}

function aggiornaVisualizzazione(processi, tempo, processoCorrenteIndex) {
  const diagramma = document.querySelector("#diagramma tbody");
  diagramma.innerHTML = "";

  const colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FF00FF',
    '#FFFF00', '#00FFFF', '#800080', '#FFA500',
    '#008000', '#000080'
  ];

  const tempoMassimo = Math.max(...processi.map(p => p.tempoCompletamento || 0), tempo);

  processi.forEach((p, index) => {
    const riga = document.createElement("tr");

    riga.innerHTML = `
      <td>${p.nome}</td>
      <td>${p.arrivo}</td>
      <td>${p.durata}</td>
      <td>${p.priorita}</td>
      <td>${p.completato ? p.turnAroundTime : '-'}</td>
      <td>${p.completato ? p.tempoAttesa : '-'}</td>
    `;

    const cellaTimeline = document.createElement("td");
    const timeline = document.createElement("div");
    timeline.style.display = "flex";
    timeline.style.width = "100%";
    timeline.style.height = "30px";
    cellaTimeline.appendChild(timeline);

    for (let t = 0; t <= tempoMassimo; t++) {
      const cella = document.createElement("div");
      cella.style.flex = "1";
      cella.style.minWidth = "30px";
      cella.style.height = "100%";
      cella.style.border = "1px solid #ddd";

      if (p.esecuzioni && p.esecuzioni.includes(t)) {
        cella.style.backgroundColor = colori[index];
      }
      timeline.appendChild(cella);
    }

    riga.appendChild(cellaTimeline);
    diagramma.appendChild(riga);
  });
}
