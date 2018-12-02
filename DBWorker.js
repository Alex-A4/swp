let MongoClient = require('mongodb').MongoClient;


let fs = require('fs');
let content = fs.readFileSync('secret.json', 'utf8');
let password = JSON.parse(content).password;
let url = `mongodb+srv://kotalesya:${password}@cluster0-koo1j.mongodb.net/test?retryWrites=true`;

const DataBaseWorker = {
   create(document) {
      console.log('START CREATE');
      console.log(document);

      return new Promise((resolve, reject) => {
         MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
            let collection = client.db('Database').collection('Documents');
            console.log(document);
            collection.insertOne(document, (err) => {
		console.log('INSERT DONE');
		console.log(err);
               client.close();
               if (err) {
                  reject(err);
               } else {
                  resolve(200);
               }
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
               client.close();
               if (err) {
                  reject(err);
               } else {
                  resolve(JSON.stringify(list));
               }
            });
         });
      });
   },

   read(idNew) {
      return new Promise((resolve, reject) => {
         MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
            let collection = client.db('Database').collection('Documents');

            collection.findOne({ id: idNew }, function(err, item) {
               
               client.close();
               if (err) {
                  reject(err);
               } else {
                  resolve(JSON.stringify(item));
               }
               
            });
         });
      });
   },

   delete(idNew) {
      idNew = idNew.replace(/"/g, '');
      return new Promise((resolve, reject) => {
         MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
            let collection = client.db('Database').collection('Documents');
            collection.deleteOne({ id: idNew }, (err, results) => {
               client.close();
               if (err) {
                  reject(err);
               } else {
                  resolve(200);
               }
            });
         });
      });
   },
   update(idNew, documentNew) {
      idNew = idNew.replace(/"/g, '');

      console.log('START UPDATE');
      return new Promise((resolve, reject) => {
         DataBaseWorker.read(idNew)
            .then((item) => {
		
               console.log('READED DBW');
               if (item && item !== "null") {
                  console.log('HAS ITEM');
                  
                  MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
                     console.log('CONNECTED');
                     console.log(err);
                     let collection = client.db('Database').collection('Documents');
                     collection.findOneAndUpdate({ id: idNew }, { $set: documentNew }, (err) => {
                        console.log('UPDATED');
                        client.close();
                        if (err) {
                           reject(err);
                        } else {
                           resolve(200);
                        }
                     });
                  });
               } else {
                       
                  console.log('TRY CREATE');
                  DataBaseWorker.create(documentNew)
                     .then(() => {
				console.log('NOW WILL RESOLVE');			
				resolve(200);
			})
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
               client.close();
               if (err) {
                  reject(err);
               } else {
                  resolve(200);
               }
            });
         });
      });
   }


};

module.exports = DataBaseWorker;
