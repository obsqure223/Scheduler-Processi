# Simulatore di Scheduling dei Processi
Ecco implementata una simulazione di diversi algoritmi di scheduling dei processi in un sistema operativo. L'utente può scegliere tra vari algoritmi, come FCFS (First Come First Served), Round Robin, Priorità, e SRTF (Shortest Remaining Time First) per simulare come un sistema operativo gestisce l'esecuzione dei processi.

# Funzionalità
Gli utenti possono generare un numero di processi con tempi di arrivo, durata ed eventuale priorità personalizzati.
Sono implementati i seguenti algoritmi di scheduling:
- FCFS (First Come First Served)
- Round Robin
- Priorità
- SRTF (Shortest Remaining Time First)
La simulazione può essere messa in pausa e ripresa senza perdere lo stato dei processi e con la possibilità di cambiare algoritmo di scheduling durante l'esecuzione.
Sono implementate una tabella per la coda e un diagramma visivo che vengono aggiornati per mostrare l'esecuzione dei processi e i relativi tempi di completamento, attesa e turnaround.

# Modalità di utilizzo
Imposta i parametri di simulazione:

Numero di Processi: Inserisci il numero di processi da generare.
Durata Massima: Definisci la durata massima per ogni processo.
Arrivo Massimo: Imposta il tempo massimo di arrivo per i processi.
Priorità Massima: Definisci la priorità massima per i processi.
Seleziona un algoritmo di scheduling: Scegli uno degli algoritmi di scheduling (Round Robin, Priorità, FCFS, SRTF).

Per avviare la simulazione premere il pulsante "Avvia Simulazione" per iniziare.
Puoi mettere la simulazione in pausa premendo il pulsante "Metti in Pausa".
Se desideri fermare completamente la simulazione, premi "Ferma Simulazione".

# Algoritmi di Scheduling

FCFS (First Come First Served)
I processi vengono eseguiti nell'ordine in cui arrivano, senza preemption. Questo significa che un processo viene eseguito fino al completamento prima che inizi il successivo.

Round Robin
Ogni processo riceve un "quantum" di tempo fisso, dopo di che viene interrotto e il controllo passa al processo successivo. Quando tutti i processi sono stati eseguiti, il ciclo ricomincia.

Priorità
I processi vengono eseguiti in base alla loro priorità. I processi con priorità più alta sono eseguiti prima, e il processo con la priorità più bassa è eseguito per ultimo.

SRTF (Shortest Remaining Time First)
Il processo con il tempo di esecuzione residuo più breve viene eseguito per primo. Questo algoritmo è un tipo di preemptive scheduling, in cui un processo può essere interrotto se un altro processo con un tempo rimanente più breve arriva.

# Tecnologie Utilizzate
HTML: Per la struttura della pagina.
CSS: Per lo stile e il layout del progetto.
JavaScript: Per la logica della simulazione, la gestione degli eventi e l'aggiornamento dinamico della pagina.

# Nota degli autori
Lo Scheduler di processi è una webApp che consente di simulare la gestione dei processi di un sistema operativo, il sistema di simulazione prevede diversi algoritmi di simulazione sia preemptive che non pre-emptive. Gli algoritmi utilizzati sono: Round Robin, Priorità, First Come First Served, Short Remaining Time First. Il progetto presenta varie funzioni per l'esecuzione della simulazione tra cui la possibilità di mettere in pausa la simulazione e la possibilità di cambiare algoritmo durante la simulazione. I processi vengono ordinati per ordine di arrivo e impilati nella Coda dei Processi che ne illustra i dati (Arrivo, Durata, Priorità). Nel progetto è implementato un tasto che permette di Fermare la Simulazione che ripulisce la schermata dai processi rendendola pulita e pronta per una nuova simulazione. Il progetto simula lo scheduling attraverso un diagramma che scorre, dove vengono riportati i dati della simulazione (Tempo di Arrivo, Tempo di Esecuzione e i dati dei singoli processi uguali a quelli sopra)

Giuseppe Emanuele Giuffrida - Raffaele Romeo

