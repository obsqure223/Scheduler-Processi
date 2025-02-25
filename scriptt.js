const processi = [];
let intervalloSimulazione = null;
let simulazioneInPausa = false;
let statoSimulazione = null;

// Seleziona i pulsanti
const avviaSimulazioneBtn = document.getElementById("avvia-simulazione");
const mettiInPausaBtn = document.getElementById("metti-in-pausa");

// Funzione per gestire il clic su "Metti in Pausa"
mettiInPausaBtn.addEventListener("click", () => {
  if (!simulazioneInPausa) {
    // Metti in pausa la simulazione
    simulazioneInPausa = true;
    mettiInPausaBtn.textContent = "Riprendi Simulazione"; // Cambia il testo del pulsante
    avviaSimulazioneBtn.textContent = "Riprendi Simulazione"; // Cambia il testo di "Avvia Simulazione"
    clearInterval(intervalloSimulazione); // Ferma l'intervallo di simulazione
  } else {
    // Riprendi la simulazione
    simulazioneInPausa = false;
    mettiInPausaBtn.textContent = "Metti in Pausa"; // Ripristina il testo del pulsante
    avviaSimulazioneBtn.textContent = "Avvia Simulazione"; // Ripristina il testo di "Avvia Simulazione"
    avviaSimulazione(); // Riprende la simulazione
  }
});

function numeroCasuale(max) {
  return Math.floor(Math.random() * max);
}

function creaProcessi() {
  const numProcessi = Number(document.getElementById("num-processi").value);
  const durataMax = Number(document.getElementById("durata-massima").value);
  const arrivoMax = Number(document.getElementById("arrivo-massimo").value);
  const prioritaMax = Number(document.getElementById("priorita-massima").value);

  processi.length = 0; // Svuota l'array dei processi

  // Crea i processi
  for (let i = 0; i < numProcessi; i++) {
    processi.push({
      nome: "P" + (i + 1), // Assegna i nomi P1, P2, P3, ...
      arrivo: i === 0 ? 0 : numeroCasuale(arrivoMax + 1), // P1 arriva al tempo 0
      durata: numeroCasuale(durataMax) + 1,
      priorita: numeroCasuale(prioritaMax) + 1
    });
  }

  // Ordina i processi per nome (P1, P2, P3, ...)
  processi.sort((a, b) => a.nome.localeCompare(b.nome));

  aggiornaTabellaProcessi(); // Aggiorna la tabella
}

function aggiornaTabellaProcessi() {
  const tbody = document.querySelector("#coda tbody");
  tbody.innerHTML = "";

  // Itera sui processi già ordinati
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
    } else if (algoritmo === "FCFS") {
      intervalloSimulazione = simulaFCFS(clock, statoSimulazione);
    }
    simulazioneInPausa = false;
    statoSimulazione = null;
    avviaSimulazioneBtn.textContent = "Avvia Simulazione"; // Ripristina il testo del pulsante
    mettiInPausaBtn.textContent = "Metti in Pausa"; // Ripristina il testo del pulsante
  } else {
    // Avvia una nuova simulazione
    if (algoritmo === "Round Robin") {
      intervalloSimulazione = simulaRoundRobin(quanto, clock);
    } else if (algoritmo === "Priorità") {
      intervalloSimulazione = simulaPriorita(clock);
    } else if (algoritmo === "FCFS") {
      intervalloSimulazione = simulaFCFS(clock);
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
    processi.length = 0;
    aggiornaTabellaProcessi();

    // Cancella il diagramma
    const diagramma = document.querySelector("#diagramma tbody");
    diagramma.innerHTML = "";

    console.log("Simulazione fermata e coda cancellata.");
  } else {
    console.log("Nessuna simulazione in corso.");
  }
}

function simulaFCFS(clock, statoIniziale = null) {
  const processiInEsecuzione = processi.map(p => ({
    ...p,
    tempoRimanente: p.durata,
    completato: false,
    esecuzioni: []
  }));

  let tempoCorrente = statoIniziale?.tempoCorrente || 0;

  const diagramma = document.querySelector("#diagramma tbody");
  diagramma.innerHTML = "";

  return setInterval(() => {
    let processoDaEseguire = null;
    for (const processo of processiInEsecuzione) {
      if (!processo.completato && processo.arrivo <= tempoCorrente) {
        processoDaEseguire = processo;
        break;
      }
    }

    if (processoDaEseguire) {
      processoDaEseguire.tempoRimanente--;
      processoDaEseguire.esecuzioni.push(tempoCorrente);

      if (processoDaEseguire.tempoRimanente === 0) {
        processoDaEseguire.completato = true;
        processoDaEseguire.tempoCompletamento = tempoCorrente + 1;
        processoDaEseguire.turnAroundTime = processoDaEseguire.tempoCompletamento - processoDaEseguire.arrivo;
        processoDaEseguire.tempoAttesa = processoDaEseguire.turnAroundTime - processoDaEseguire.durata;
      }

      aggiornaVisualizzazione(processiInEsecuzione, tempoCorrente);
    }

    tempoCorrente++;

    if (processiInEsecuzione.every(p => p.completato)) {
      aggiornaVisualizzazione(processiInEsecuzione, tempoCorrente);
      clearInterval(intervalloSimulazione);
      mostraRisultatiFinali(processiInEsecuzione);
    }

    statoSimulazione = {
      processiInEsecuzione,
      tempoCorrente
    };
  }, clock);
}

function simulaPriorita(clock, statoIniziale = null) {
  const processiInEsecuzione = processi.map(p => ({
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

    statoSimulazione = {
      processiInEsecuzione,
      tempoCorrente
    };
  }, clock);
}

function simulaRoundRobin(quanto, clock, statoIniziale = null) {
  const processiInEsecuzione = processi.map(p => ({
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

  // Ordina i processi per nome (P1, P2, P3, ...)
  const processiOrdinati = [...processi].sort((a, b) => a.nome.localeCompare(b.nome));

  const tempoMassimo = Math.max(...processiOrdinati.map(p => p.tempoCompletamento || 0), tempo);

  processiOrdinati.forEach((p, index) => {
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

function mostraRisultatiFinali(processiInEsecuzione) {
  const risultatiDiv = document.getElementById("risultati-finali");
  risultatiDiv.innerHTML = ""; // Pulisci il contenuto precedente

  // Crea una tabella per visualizzare i risultati
  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Processo</th>
        <th>Tempo di Arrivo</th>
        <th>Durata</th>
        <th>Priorità</th>
        <th>Tempo di Completamento</th>
        <th>Turnaround Time</th>
        <th>Tempo di Attesa</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
  `;

  const tbody = table.querySelector("tbody");

  // Aggiungi una riga per ogni processo
  for (const processo of processiInEsecuzione) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${processo.nome}</td>
      <td>${processo.arrivo}</td>
      <td>${processo.durata}</td>
      <td>${processo.priorita}</td>
      <td>${processo.tempoCompletamento}</td>
      <td>${processo.turnAroundTime}</td>
      <td>${processo.tempoAttesa}</td>
    `;
    tbody.appendChild(row);
  }

  // Aggiungi la tabella all'area dei risultati
  risultatiDiv.appendChild(table);
}
