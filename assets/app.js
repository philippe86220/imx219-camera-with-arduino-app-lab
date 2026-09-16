const ui = new WebUI();

ui.on_connect(onUIConnected);


const bouton = document.getElementById(
  "boutonPhoto"
);

const etat = document.getElementById(
  "etat"
);

const photo = document.getElementById(
  "photo"
);

const exposure = document.getElementById(
  "exposure"
);

const gain = document.getElementById(
  "gain"
);

const exposureValue = document.getElementById(
  "exposureValue"
);

const gainValue = document.getElementById(
  "gainValue"
);

const appliquerReglages = document.getElementById(
  "appliquerReglages"
);


function onUIConnected() {
  console.log(
    "WebUI connectée"
  );

  etat.textContent = "Initialisation...";

  ui.send_message(
    "get_camera_defaults",
    {}
  );
}


exposure.addEventListener(
  "input",
  function () {
    exposureValue.textContent = exposure.value;
  }
);


gain.addEventListener(
  "input",
  function () {
    gainValue.textContent = gain.value;
  }
);


appliquerReglages.addEventListener(
  "click",
  function () {
    etat.textContent = "Application des réglages...";

    ui.send_message(
      "regler_camera",
      {
        exposure: Number(
          exposure.value
        ),
        analogue_gain: Number(
          gain.value
        )
      }
    );
  }
);


bouton.addEventListener(
  "click",
  function () {
    bouton.disabled = true;

    etat.textContent = "Capture en cours...";

    ui.send_message(
      "prendre_photo",
      {}
    );
  }
);


ui.on_message(
  "camera_settings_update",
  function (data) {
    if (data.ok) {
      etat.textContent = "Réglages appliqués";
    } else {
      etat.textContent =
        "Erreur réglages : " + data.error;
    }
  }
);


ui.on_message(
  "camera_defaults",
  function (data) {
    exposure.value = data.exposure;
    gain.value = data.analogue_gain;

    exposureValue.textContent = data.exposure;
    gainValue.textContent = data.analogue_gain;

    etat.textContent = "Prêt";
  }
);


ui.on_message(
  "photo_update",
  function (data) {
    bouton.disabled = false;

    if (data.ok) {
      etat.textContent = "Photo capturée";

      photo.src =
        "data:image/jpeg;base64,"
        + data.image;
    } else {
      etat.textContent =
        "Erreur : " + data.erreur;
    }
  }
);
