import {
  getApps,
  initializeApp,
  cert
} from "firebase-admin/app";

import {
  getFirestore
} from "firebase-admin/firestore";

import serviceAccount from "./mitservices.json.json"
  with { type: "json" };


const app =
  getApps().length
    ? getApps()[0]
    : initializeApp({
        credential:
          cert(serviceAccount)
      });


const db =
  getFirestore(app);


export {
  db
};