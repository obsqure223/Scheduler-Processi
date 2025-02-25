const processi = [];
let intervalloSimulazione = null;
let simulazioneInPausa = false;
let statoSimulazione = null;

function numeroCasuale(max) {
  return Math.floor(Math.random() * max);
}

function creaProcessi() {
  const numProcessi = Number(document.getElementById("num-processi").value);
  const durataMax = Number(document.getElementById("durata-massima").value);
  const arrivoMax = Number(document.getElementById("arrivo-massimo").value);
  const prioritaMax = Number(document.getElementById("priorita-massima").value);

  processi.length = 0;

  processi.push({
    nome: "P1",
    arrivo: 0,
    durata: numeroCasuale(durataMax) + 1,
    priorita: numeroCasuale(prioritaMax) + 1
  });

  for (let i = 1; i < numProcessi; i++) {
    processi.push({
      nome: "P" + (i + 1),
      arrivo: numeroCasuale(arrivoMax + 1),
      durata: numeroCasuale(durataMax) + 1,
      priorita: numeroCasuale(prioritaMax) + 1
    });
  }

  processi.sort((a, b) => a.arrivo - b.arrivo);

  aggiornaTabellaProcessi();
}

function aggiornaTabellaProcessi() {
  const tbody = document.querySelector("#coda tbody");
  tbody.innerHTML = "";

  for (let p of processi) {
    const row = document.createElement("tr");

    const cellNome = document.createElement("td");
    cellNome.innerHTML = `<strong>${p.nome}</strong>`;
    row.appendChild(cellNome);

    const cellArrivo = document.createElement("td");
    cellArrivo.textContent = p.arrivo;
    row.appendChild(cellArrivo);

    const cellDurata = document.createElement("td");
    cellDurata.textContent = p.durata;
    row.appendChild(cellDurata);

    const cellPriorita = document.createElement("td");
    cellPriorita.textContent = p.priorita;
    row.appendChild(cellPriorita);

    tbody.appendChild(row);
  }
}

document.getElementById("avvia-simulazione").addEventListener("click", () => {
  avviaSimulazione();
});

document.getElementById("ferma-simulazione").addEventListener("click", () => {
  fermaSimulazione();
});

document.getElementById("metti-in-pausa").addEventListener("click", () => {
  mettiInPausaSimulazione();
});

function avviaSimulazione() {
  const algoritmo = document.getElementById("algoritmo").value;
  const quanto = Number(document.getElementById("quanto").value);
  const clock = Number(document.getElementById("clock").value);

  if (simulazioneInPausa) {
    // Riprendi la simulazione dallo stato memorizzato
    if (algoritmo === "Round Robin") {
      intervalloSimulazione = simulaRoundRobin(quanto, clock, statoSimulazione);
    } else if (algoritmo === "Priorità") {
      intervalloSimulazione = simulaPriorita(clock, statoSimulazione);
    }
    simulazioneInPausa = false;
    statoSimulazione = null;
  } else {
    // Avvia una nuova simulazione
    if (algoritmo === "Round Robin") {
      intervalloSimulazione = simulaRoundRobin(quanto, clock);
    } else if (algoritmo === "Priorità") {
      intervalloSimulazione = simulaPriorita(clock);
    }
  }
}

function fermaSimulazione() {
  if (intervalloSimulazione) {
    clearInterval(intervalloSimulazione);
    intervalloSimulazione = null;
    simulazioneInPausa = false;
    statoSimulazione = null;

    // Cancella la coda dei processi
    processi.length = 0; // Svuota l'array dei processi
    aggiornaTabellaProcessi(); // Aggiorna la tabella per riflettere la coda vuota

    // Cancella il diagramma
    const diagramma = document.querySelector("#diagramma tbody");
    diagramma.innerHTML = "";

    console.log("Simulazione fermata e coda cancellata.");
  } else {
    console.log("Nessuna simulazione in corso.");
  }
}

function mettiInPausaSimulazione() {
  if (intervalloSimulazione && !simulazioneInPausa) {
    clearInterval(intervalloSimulazione);
    simulazioneInPausa = true;
    console.log("Simulazione in pausa.");
  } else {
    console.log("Nessuna simulazione in corso o già in pausa.");
  }
}

function simulaPriorita(clock, statoIniziale = null) {
  const processiInEsecuzione = statoIniziale?.processiInEsecuzione || processi.map(p => ({
    ...p,
    tempoRimanente: p.durata,
    completato: false,
    esecuzioni: []
  }));

  let tempoCorrente = statoIniziale?.tempoCorrente || 0;

  const diagramma = document.querySelector("#diagramma tbody");
  diagramma.innerHTML = "";

  return setInterval(() => {
    let processoMigliore = null;
    let prioritaMigliore = Infinity;

    for (const processo of processiInEsecuzione) {
      if (!processo.completato &&
        processo.arrivo <= tempoCorrente &&
        processo.tempoRimanente > 0 &&
        processo.priorita < prioritaMigliore) {
        processoMigliore = processo;
        prioritaMigliore = processo.priorita;
      }
    }

    if (processoMigliore) {
      processoMigliore.tempoRimanente--;
      processoMigliore.esecuzioni.push(tempoCorrente);

      if (processoMigliore.tempoRimanente === 0) {
        processoMigliore.completato = true;
        processoMigliore.tempoCompletamento = tempoCorrente + 1;
        processoMigliore.turnAroundTime = processoMigliore.tempoCompletamento - processoMigliore.arrivo;
        processoMigliore.tempoAttesa = processoMigliore.turnAroundTime - processoMigliore.durata;
      }

      aggiornaVisualizzazione(processiInEsecuzione, tempoCorrente);
    }

    tempoCorrente++;

    if (processiInEsecuzione.every(p => p.completato)) {
      aggiornaVisualizzazione(processiInEsecuzione, tempoCorrente);
      clearInterval(intervalloSimulazione);
      mostraRisultatiFinali(processiInEsecuzione);
    }

    // Memorizza lo stato corrente per la pausa
    statoSimulazione = {
      processiInEsecuzione,
      tempoCorrente
    };
  }, clock);
}

function simulaRoundRobin(quanto, clock, statoIniziale = null) {
  const processiInEsecuzione = statoIniziale?.processiInEsecuzione || processi.map(p => ({
    ...p,
    tempoRimanente: p.durata,
    completato: false,
    quantumUsato: 0,
    esecuzioni: []
  }));
  let tempoCorrente = statoIniziale?.tempoCorrente || 0;
  let indiceProcessoCorrente = statoIniziale?.indiceProcessoCorrente || 0;

  const diagramma = document.querySelector("#diagramma tbody");
  diagramma.innerHTML = "";

  return setInterval(() => {
    let processoTrovato = false;
    let contatore = 0;

    while (!processoTrovato && contatore < processiInEsecuzione.length) {
      const processo = processiInEsecuzione[indiceProcessoCorrente];

      if (!processo.completato && processo.arrivo <= tempoCorrente && processo.tempoRimanente > 0) {
        processoTrovato = true;
        processo.quantumUsato++;
        processo.tempoRimanente--;
        processo.esecuzioni.push(tempoCorrente);

        aggiornaVisualizzazione(processiInEsecuzione, tempoCorrente, indiceProcessoCorrente);

        if (processo.tempoRimanente === 0) {
          processo.completato = true;
          processo.tempoCompletamento = tempoCorrente + 1;
          processo.turnAroundTime = processo.tempoCompletamento - processo.arrivo;
          processo.tempoAttesa = processo.turnAroundTime - processo.durata;
          processo.quantumUsato = 0;
        } else if (processo.quantumUsato >= quanto) {
          processo.quantumUsato = 0;
          indiceProcessoCorrente = (indiceProcessoCorrente + 1) % processiInEsecuzione.length;
        }
      } else {
        indiceProcessoCorrente = (indiceProcessoCorrente + 1) % processiInEsecuzione.length;
      }
      contatore++;
    }

    tempoCorrente++;

    if (processiInEsecuzione.every(p => p.completato)) {
      aggiornaVisualizzazione(processiInEsecuzione, tempoCorrente);
      clearInterval(intervalloSimulazione);
      mostraRisultatiFinali(processiInEsecuzione);
    }

    // Memorizza lo stato corrente per la pausa
    statoSimulazione = {
      processiInEsecuzione,
      tempoCorrente,
      indiceProcessoCorrente
    };
  }, clock);
}

function aggiornaVisualizzazione(processi, tempo, processoCorrenteIndex) {
  const diagramma = document.querySelector("#diagramma tbody");
  diagramma.innerHTML = "";
  
  const tempoMassimo = Math.max(...processi.map(p => p.tempoCompletamento || 0), tempo);

  processi.forEach((p, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${p.nome}</td>
      <td>${p.arrivo}</td>
      <td>${p.durata}</td>
      <td>${p.priorita}</td>
      <td>${p.completato ? p.turnAroundTime : '-'}</td>
      <td>${p.completato ? p.tempoAttesa : '-'}</td>
    `;

    const timelineCell = document.createElement("td");
    const timeline = document.createElement("div");
    timeline.style.display = "flex";
    timeline.style.width = "100%";
    timeline.style.height = "30px";
    timelineCell.appendChild(timeline);

    for (let t = 0; t <= tempoMassimo; t++) {
      const cell = document.createElement("div");
      cell.style.flex = "1";
      cell.style.minWidth = "30px";
      cell.style.height = "100%";
      cell.style.border = "1px solid #ddd";

      if (p.esecuzioni && p.esecuzioni.includes(t)) {
        cell.style.backgroundColor = "#FFD700";
      }
      timeline.appendChild(cell);
    }

    row.appendChild(timelineCell);
    diagramma.appendChild(row);
  });
}
