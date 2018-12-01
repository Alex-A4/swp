let MongoClient = require('mongodb').MongoClient;


let fs = require('fs');
let content = fs.readFileSync('secret.json', 'utf8');
let password = JSON.parse(content).password;
let url = `mongodb+srv://kotalesya:${password}@cluster0-koo1j.mongodb.net/test?retryWrites=true`;

const DataBaseWorker = {
   create(document) {
      return new Promise((resolve, reject) => {
         MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
            let collection = client.db('Database').collection('Documents');
            console.log(document);
            collection.insertOne(document, (err) => {
               if (err) {
                  reject(err);
               } else {
                  resolve(200);
               }
               client.close();
            });
         });
      });
   },

   list() {
      console.log(1111);
      return new Promise((resolve, reject) => {
         MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
            let collection = client.db('Database').collection('Documents');
            collection.find().toArray(function(err, list) {
               if (err) {
                  reject(err);
               } else {
                  resolve(JSON.stringify(list));
               }
               client.close();
            });
         });
      });
   },

   read(idNew) {
      return new Promise((resolve, reject) => {
         MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
            let collection = client.db('Database').collection('Documents');

            collection.findOne({ id: idNew }, function(err, item) {
               if (err) {
                  reject(err);
               } else {
                  resolve(JSON.stringify(item));
               }
               client.close();
            });
         });
      });
   },

   delete(idNew) {
      return new Promise((resolve, reject) => {
         MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
            let collection = client.db('Database').collection('Documents');
            collection.deleteOne({ id: idNew }, (err, results) => {
               if (err) {
                  reject(err);
               } else {
                  resolve(200);
               }
               client.close();
            });
         });
      });
   },
   update(idNew, documentNew) {
      return new Promise((resolve, reject) => {
         DataBaseWorker.read(idNew)
            .then((item) => {
               if (item) {
                  MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
                     let collection = client.db('Database').collection('Documents');
                     collection.findOneAndUpdate({ id: idNew }, { $set: documentNew }, (err) => {
                        if (err) {
                           reject(err);
                        } else {
                           resolve(200);
                        }
                        client.close();
                     });
                  });
               } else {
                  DataBaseWorker.create(documentNew)
                     .then(() => resolve(200))
                     .catch(err => reject(err));
               }
            })
            .catch(err => reject(err));
      });
   },

   sync(documents) {
      return new Promise((resolve, reject) => {
         MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
            let collection = client.db('Database').collection('Documents');
            collection.insertMany(documents, (err) => {
               if (err) {
                  reject(err);
               } else {
                  resolve(200);
               }
               client.close();
            });
         });
      });
   }


};

module.exports = DataBaseWorker;
