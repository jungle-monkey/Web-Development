//Importing the application to test
let server = require('../index');

//These are the actual modules we use
let chai = require('chai');
let should = chai.should();
let chaiHttp = require('chai-http');
chai.use(chaiHttp);

let apiUrl = "http://localhost:3000/api/v1";

describe('Endpoint tests', () => {
    //###########################
    //The beforeEach function makes sure that before each test, 
    //there are exactly two boards and one task (for the first board).
    //###########################
    
    beforeEach((done) => {
        server.resetState();
        done();
    });

    //###########################
    // Tests
    //###########################

    //First Endpoint : read all boards

    it('GET /boards', function(done){
        chai.request(apiUrl)
            .get('/boards').end((err, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res).to.be.json;
                chai.expect(res.body).to.be.a('array');
                //chai.expect(res.body.length).to.eql(2);
                chai.expect(res.body[0]).to.be.a('object');
                chai.expect(res.body[1]).to.be.a('object');
                chai.expect(res.body[0]).to.have.property('id'); // .eql('0');
                chai.expect(res.body[0]).to.have.property('name').eql('Planned');
                chai.expect(res.body[0]).to.have.property('description').eql('My todo list.');
                chai.expect(Object.keys(res.body[0]).length).to.be.eql(3);
                done();
        
            })
    });

    //Second Endpoint : read an individual board

     it('GET /boards/:boardId', function(done){
        chai.request(apiUrl)
            .get('/boards/0').end((err, res)  => {
                chai.expect(res).to.have.status(200);
                chai.expect(res).to.be.json;
                chai.expect(res.body).to.be.a('object');
                chai.expect(res.body).to.have.property('id').eql('0');
                chai.expect(res.body).to.have.property('name').eql('Planned');
                chai.expect(res.body).to.have.property('description').eql('My todo list.');
                chai.expect(res.body).to.have.property('tasks').to.be.a('array').eql(['0']);
                chai.expect(Object.keys(res.body).length).to.eql(4);
                done();

            })
    });

    //Third Endpoint : create a new board

    it('POST /boards', function(done){
        chai.request(apiUrl)
            .post('/boards')
            .set('Content-type', 'application/json')
            .send({'name': 'Done', 'description': 'Already reviewed.'})
            .end((err, res)  => {
                chai.expect(res).to.have.status(201);
                chai.expect(res).to.be.json;
                chai.expect(res.body).to.be.a('object');
                //chai.expect(res.body).to.have.property('id').eql(2);
                chai.expect(res.body).to.have.property('name').eql('Done');
                chai.expect(res.body).to.have.property('description').eql('Already reviewed.');
                chai.expect(res.body).to.have.property('tasks').to.be.a('array').eql([]);
                chai.expect(Object.keys(res.body).length).to.eql(4);
                done();

            })
    });

    //Fourth Endpoint : update/modify a board

    it('PUT /boards/:boardId', function(done){
        chai.request(apiUrl)
            .put('/boards/1')
            .set('Content-type', 'application/json')
            .send({'name': 'Ongoing', 'description': 'WIP.'})
            .end((err, res)  => {
                chai.expect(res).to.have.status(200);
                chai.expect(res).to.be.json;
                chai.expect(res.body).to.be.a('object');
                chai.expect(res.body).to.have.property('id').eql('1');
                chai.expect(res.body).to.have.property('name').eql('Ongoing');
                chai.expect(res.body).to.have.property('description').eql('WIP.');
                chai.expect(res.body).to.have.property('tasks').to.be.a('array').eql([]);
                chai.expect(Object.keys(res.body).length).to.eql(4);
                done();

            })
    });
    
            //Making sure it fails when a property is missing

            it('PUT /boards/:boardId', function(done){
                chai.request(apiUrl)
                    .put('/boards/1')
                    .set('Content-type', 'application/json')
                    .send({'name': 'Ongoing'})
                    .end((err, res)  => {
                        chai.expect(res).to.have.status(400);
                        chai.expect(res).to.be.json;
                        chai.expect(res.body).to.have.property('message').eql('To update a board, all attributes are needed (name and description).')
                        done();

                    })
            });


    //Fifth Endpoint : read all tasks for a board

    it('GET /boards/:boardId/tasks', function(done){
        chai.request(apiUrl)
            .get('/boards/0/tasks').end((err, res)  => {
                chai.expect(res).to.have.status(200);
                chai.expect(res).to.be.json;
                chai.expect(res.body).to.be.a('array');
                chai.expect(res.body[0]).to.be.a('object');
                chai.expect(res.body[0]).to.have.property('id').eql('0');
                chai.expect(res.body[0]).to.have.property('boardId').eql('0');
                chai.expect(res.body[0]).to.have.property('taskName').eql('A task');
                chai.expect(res.body[0]).to.have.property('dateCreated').eql('2021-01-21T15:48:00.000Z');
                chai.expect(res.body[0]).to.have.property('archived').eql(false);
                chai.expect(Object.keys(res.body[0]).length).to.be.eql(5);
                done();
        
            })
    });

    //Sixth Endpoint : read an individual task

    it('GET /boards/:boardId/tasks/:taskId', function(done){
        chai.request(apiUrl)
            .get('/boards/0/tasks/0').end((err, res)  => {
                chai.expect(res).to.have.status(200);
                chai.expect(res).to.be.json;
                chai.expect(res.body).to.be.a('object');
                chai.expect(res.body).to.have.property('id').eql('0');
                chai.expect(res.body).to.have.property('boardId').eql('0');
                chai.expect(res.body).to.have.property('taskName').eql('A task');
                chai.expect(res.body).to.have.property('dateCreated').eql(Date.parse('2021-01-21T15:48:00.000Z'));
                chai.expect(res.body).to.have.property('archived').eql(false);
                chai.expect(Object.keys(res.body).length).to.eql(5);
                done();

            })
    });

    //Seventh Endpoint : create a new task 

    it('POST /boards/:boardId/tasks', function(done){
        chai.request(apiUrl)
            .post('/boards/1/tasks')
            .set('Content-type', 'application/json')
            .send({'taskName': 'Study for the exam.'})
            .end((err, res)  => {
                chai.expect(res).to.have.status(201);
                chai.expect(res).to.be.json;
                chai.expect(res.body).to.be.a('object');
                //chai.expect(res.body).to.have.property('id').eql('1');
                chai.expect(res.body).to.have.property('boardId').eql('1');
                chai.expect(res.body).to.have.property('taskName').eql('Study for the exam.');
                chai.expect(res.body).to.have.property('archived').eql(false);
                chai.expect(Object.keys(res.body).length).to.eql(5);
                done();

            })
    });  

    //Eighth Endpoint : authentication

    it('POST /auth', function(done){
        chai.request(apiUrl)
            .post('/auth')
            .set('Content-type', 'application/json')
            .set('Authorization', 'Basic ' + Buffer.from('admin:secret', 'binary').toString('base64'))
            .send()
            .end((err, res)  => {
                chai.expect(res).to.have.status(200);
                chai.expect(res).to.be.json;
                chai.expect(res.body).to.be.a('object');
                chai.expect(res.body).to.have.property('token');
                chai.expect(Object.keys(res.body).length).to.eql(1);
                done();
            })
    });  

    //Ninth Endpoint : delete an individual board

    it('DELETE /boards/:boardId', function(done){
         chai.request(apiUrl)
            .post('/auth')
            .set('Content-type', 'application/json')
            .set('Authorization', 'Basic ' + Buffer.from('admin:secret', 'binary').toString('base64'))
            .send()
            .end((err1, res1)  => {
                let myToken = res1.body.token[0];
                chai.request(apiUrl)
                .delete('/boards/1')
                .set('Content-type', 'application/json')
                .set('Authorization', 'Bearer ' + myToken)
                .send()
                .end((err2, res2)  => {
                    chai.expect(res2).to.have.status(200);
                    done();
                })
            })
    });  

}); 
