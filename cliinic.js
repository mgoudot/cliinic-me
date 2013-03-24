//---------------- COLLECTIONS ----------------

Patients = new Meteor.Collection("patients");
Case = new Meteor.Collection("cases");
Diagnoses = new Meteor.Collection("diagnoses");
Players = new Meteor.Collection("players");
Disease = new Meteor.Collection("disease");
Symptoms = new Meteor.Collection("symptoms");
Investigations = new Meteor.Collection("investigations")




//----------------        ----------------
//---------------- CLIENT ----------------
//----------------        ----------------


if (Meteor.isClient) {




//---------------- VARIABLES ----------------

var stage = 0;

Session.set('arrivalStage', true); //0
Session.set('greetingStage', false); //1
Session.set('testsStage', false); //2
Session.set('waitResultsStage', false); //3
Session.set('resultsStage', false); //4
Session.set('waitDiagnosisStage', false); //5
Session.set('diagnosesStage', false); //6
Session.set('successStage', false); //7
//This particular stage can coexist with other stages and is not in the setStage function
Session.set('wrongStage', false);
Session.set('error', null);

var setStage = function (i) {
  stageArray = ['arrivalStage','greetingStage', 'testsStage', 'waitResultsStage','resultsStage', 'waitDiagnosisStage', 'diagnosesStage','successStage']
  for (var k = 0; k<stageArray.length;k++){
    Session.set(stageArray[k], false);
  }
  Session.set(stageArray[i], true);
}




  //---------------- HELPERS ----------------

  //EMMER EFFIN GOOD HELPER

  Handlebars.registerHelper('session',function(input){
    return Session.get(input);
});




  //---------------- TEMPLATES ----------------

  //Template filling like cream, lots of dejudifying to do

  Template.testsPanel.investigations = function () {
    if (Patients.findOne({name:"Judy"})) {
      return Investigations.find({patient_id:"judy"}).fetch()
    }
  };

  Template.diagnosesPanel.diagnoses = function () {
    if (Patients.findOne({name:"Judy"})) {
      return Diagnoses.find({patient_id:"judy"}).fetch()
    }
  }

  Template.newPatient.patient = function () {
    if (Patients.findOne({name:"Judy"})) {
      return Patients.findOne({name:"Judy"})
    }
  };

  Template.results.results = function() {
  };

  Template.greetingsPanel.patient = function() {
    if (Patients.findOne({name:"Judy"})) {
      return Patients.findOne({name:"Judy"})
    }
  };

  Template.testsPanel.patient = function() {
  if (Patients.findOne({name:"Judy"})) {
    return Patients.findOne({name:"Judy"})
    }
  };

  Template.resultsPanel.patient = function() {
  if (Patients.findOne({name:"Judy"})) {
    return Patients.findOne({name:"Judy"})
    }
  };

  Template.diagnosesPanel.patient = function() {
  if (Patients.findOne({name:"Judy"})) {
    return Patients.findOne({name:"Judy"})
      }
    };

  Template.successPanel.patient = function() {
  if (Patients.findOne({name:"Judy"})) {
    return Patients.findOne({name:"Judy"})
      }
    };



  //---------------- EVENTS ----------------

  Template.newPatient.events({
    'click a.newPatient' : function () {
      patient_id = $('p[class="newPatient"]').attr('id')
      // this adds the current patient being treated to the user profile.
      if (!Meteor.user().profile.current.patient) {
        Meteor.call("newPatient", Meteor.user(), patient_id);
      }
      Meteor.setTimeout(function () {
      stage = stage + 1;
      setStage(stage);
      }, 100);
    },

    'click button.close' : function() {
      Meteor.setTimeout(function () {
      stage = 0;
      setStage(stage);
      }, 300);
    },

    'click a.results':function() {
      //goes from waitResultsStage to resultsStage
      stage = 4
      setStage(stage)
    },

    'click a.diag':function() {
      stage = 6
      setStage(stage)
    },  

    'click a.retryTest':function(){
      //resets to testsStage
      stage = 2
      setStage(stage)
    }

  })

  Template.feed.events({
    'click a.next' : function () {
      Meteor.setTimeout(function(){
        stage = stage + 1;
        setStage(stage);
      }, 200)}
  })

  Template.testsPanel.events({ 
    'click a.test' : function() {
      tests = [];

      $(":checkbox:checked").each(function() { 
        tests.push(($(this).attr('id')));
      });
      //might need to dejudify this.
        if (tests.length < 3) {
        //finding out if the tests are the good ones
        results = []
        for (var i = 0; i < tests.length; i++ ) {
          result = Investigations.findOne({ $and: [ { name: tests[i] }, { patient_id: "judy" }, { case_id: "judy_first" } ]}).result
          abnormal = Investigations.findOne({ $and: [ { name: tests[i] }, { patient_id: "judy" }, { case_id: "judy_first" } ]}).abnormal
          results.push({'test': tests[i], 'result':result, 'abnormal': abnormal})
        }
        console.log(results);
        console.log(tests);
        Meteor.users.update(Meteor.user()._id, 
          {$set:{
            'profile.current.investigations':tests,
            'profile.current.results':results
          }});
        //allow to progress in the game
        stage++
        setStage(stage)

        //This is to give a hint: where to click after the results, from user feedback.
        Meteor.setTimeout(function(){
          $('a[class="results"]').tooltip('show')
          }, 400);
       
      }
    },

  });

  Template.diagnosesPanel.events({ 
    'click a.diagnose' : function() {
      diag = $(":radio:checked").attr('id');
       Meteor.users.update(Meteor.user._id,
      {$set:{'profile.current.diagnoses' : diag}})
      win = Diagnoses.findOne({ $and: [ { name: diag }, { patient_id: "judy" }, { case_id: "judy_first" } ]}).correct
      console.log(win)
      if (win) {
        Session.set("wrongStage", false)
        Meteor.users.update(Meteor.user()._id, {
          $inc:{'profile.xp':70},
        });
        Meteor.users.update(Meteor.user()._id, {
          $inc:{'profile.reputation':70}
        });
        stage++
        setStage(stage)
      } else {
        Session.set("wrongStage", true)
        stage++
        setStage(stage)
      }
    }
  });

  Template.successPanel.events({
    'click a.retry':function() {
      //resets to waitDiagnosisStage
      stage = 5
      setStage(stage)
    }
  })


  Template.newPatient.rendered = function () {
    $('a[rel=tooltip]').tooltip();
  }

  Template.unlogged.rendered = function() {
    $('a[rel=tooltip]').tooltip();
    Meteor.setTimeout(function(){$('a[class="moa start"]').tooltip('show')}, 800)
  }



  Template.investigation.events({
    'click label.checkbox' : function () {
      if ($(":checkbox:checked").length >2){
        Session.set('error', "I said ONLY TWO tests. Please?");
        console.log("hello")
      } else {
        Session.set('error', null)
      }
    }
  });

};



//----------------        ----------------
//---------------- SERVER ----------------
//----------------        ----------------


if (Meteor.isServer) {



//---------------- METHODS ----------------

Meteor.methods({
  newPatient : function(user, patient_id) {
    Meteor.users.update(user, 
      {$set:{'profile.current.patient':patient_id}})
  },

  addCurrentTestsAndResults : function(user, tests, results) {
    Meteor.users.update(user, 
      {$set:{
        'profile.current.investigations':tests,
        'profile.current.results':results
      }});
    console.log(user)
  },

  addCurrentDiagnosis : function (user, diag) {
    Meteor.users.update(user,
      {$set:{
        'profile.current.diagnoses' : diag
      }}
      )
  },

  addXPAndReputation : function (user, xp, rep) {
    console.log(xp + ' ' + rep)
    Meteor.users.update(user,
      {$inc:{
        'profile.xp': xp
      },
      $inc:{
        'profile.reputation': rep
      }
    }
      )
  }

})



//---------------- USER ACCOUNTS ----------------

Accounts.onCreateUser(function(options, user) {
      user.profile = {
        name:"",
        reputation:0, 
        xp:0,
        current:{
          patient:null,
          case:null,
          investigations:[],
          results:[],
          diagnoses:[],
        },
        archive:[],
        }
    return user;
});



//---------------- STARTUP ----------------

  Meteor.startup(function () {
    // code to run on server at startup
    if (Patients.find().count() === 0) {
      Patients.insert({
        name:"Judy",
        id:"judy",
        level:1,
        bio:"",
        // need to cut off this into the classes it belongs to.
        case:[{
          name:"judy_first",
          solved:false,
          greeting:"My right knee is swollen and more and more painful over the past day. I don’t really know what caused it – I didn’t injure it or anything. I’m 42 years old, generally healthy and taking no medications. This has never happened to me before. A few hours after my knee pain started my hands and wrists are also starting to hurt so much that I can barely do anything!",
          investigations:[
            {name:"Physical Exam"},
            {name:"Imaging X-ray"},
            {name:"Imaging CT"},
            {name:"Sample joint fluid throught aspiration"},
            {name:"Blood count"},
            {name:"Blood antibody test/Autoimmune screen"}
            ],
            diagnoses:[
            {name:"Gout",correct:false},
            {name:"Pseudogout",correct:false},
            {name:"Bacterial Arthritis",correct:true},
            {name:"Trauma",correct:false},
            {name:"Rheumatoid Arthritis",correct:false},
            {name:"Osteoarthritis",correct:false}
            ],
            success:"Congratulations, Judy feels much better!",
          }]
        });

    inv = [{name:"Physical Exam",
        patient_id:"judy",
        case_id:"judy_first",
        desc:"Examine the patient",
        result:"Slight fever (38°C), redness over back of hands the knee joint is red, warm, swollen, and extermely tender. The wrists and hands are also warm and swollen.",
        abnormal:true},
        {name:"Imaging X-ray",
        patient_id:"judy",
        case_id:"judy_first",
        desc:"Looking at the joint, specifically the bone, low radiation",
        result:"No fractures. Normal joint except some tissue swelling.",
        abnormal:false},
        {name:"Imaging CT",
        patient_id:"judy",
        case_id:"judy_first",
        desc:"Looking at the joint, with more details on soft tissue and fluids, high radiation",
        result:"No fractures. Normal joint except some tissue swelling.",
        abnormal:false},
        {name:"Sample joint fluid through aspiration",
        patient_id:"judy",
        case_id:"judy_first",
        desc:"Inserting a needle into the joint space and analyzing the synovid fluid, low risk for complications.",
        result:"Severe inflammation (many white blood cells). No infection or crystals found. However, note that an infection could still be present despite a negative test.",
        abnormal:true},
        {name:"Blood count",
        patient_id:"judy",
        case_id:"judy_first",
        desc:"Drawing a blood sample to take a look at the numbers of white blood cells, red blood cells and platelets, good for identifying infection, low risk for complications.",
        result:"Normal.",
        abnormal:false},
        {name:"Blood antibody test/Autoimmune screen",
        patient_id:"judy",
        case_id:"judy_first",
        desc:"Expensive test to find antibodies that are specific to certain autoimmune diseases.",
        result:"Normal.",
        abnormal:false}]

    for (var i=0; i<inv.length; i++) {
      Investigations.insert(inv[i]);
    }
    
        
    diag = [
      {name:"Gout",
      patient_id:"judy",
      case_id:"judy_first",
      correct:false},
      {name:"Pseudogout",
      patient_id:"judy",
      case_id:"judy_first",
      correct:false},
      {name:"Bacterial Arthritis",
      patient_id:"judy",
      case_id:"judy_first",
      correct:true},
      {name:"Trauma",
      patient_id:"judy",
      case_id:"judy_first",
      correct:false},
      {name:"Rheumatoid Arthritis",
      patient_id:"judy",
      case_id:"judy_first",
      correct:false},
      {name:"Osteoarthritis",
      patient_id:"judy",
      case_id:"judy_first",
      correct:false}
      ]
    
    for (var i=0; i<inv.length; i++){
      Diagnoses.insert(diag[i]);
    }
  }

  });
}

//---------------- THAT'S ALL FOLKS, MEOWWRRR ----------------

