//---------------- COLLECTIONS ----------------

Patients = new Meteor.Collection("patients");
Case = new Meteor.Collection("cases");
Diagnoses = new Meteor.Collection("diagnoses");
Players = new Meteor.Collection("players");
Disease = new Meteor.Collection("disease");
Symptoms = new Meteor.Collection("symptoms");
Investigations = new Meteor.Collection("investigations")
Log = new Meteor.Collection("log");



//----------------        ----------------
//---------------- CLIENT ---------------- 
//----------------        ----------------


if (Meteor.isClient) {



//---------------- VARIABLES & FUNCTIONS ----------------

//stage allows to navigate in all the session-stage variable, thanks to the setStage() function
stage = 0;
//when in epilogueStage, epPhase allow to navigate inside the questions.
epPhase = 0;

Session.set('arrivalStage', true); //0
Session.set('greetingStage', false); //1
Session.set('testsStage', false); //2
Session.set('waitResultsStage', false); //3
Session.set('resultsStage', false); //4
Session.set('waitDiagnosisStage', false); //5
Session.set('diagnosesStage', false); //6
Session.set('successStage', false); //7
Session.set('epilogueStage', false); //8
Session.set('finalStage', false); //9

//This particular stage can coexist with other stages and is not in the setStage function
Session.set('wrongStage', false);

Session.set('error', null);

//This status session variables are here for the narrative structure.
//They appear in greetingStage and successStage.
Session.set('patientStatus', null)
Session.set('nurseStatus', null)
Session.set('narratorStatus', null)

Session.set('epilogue', null)


setStage = function (i) {
  stageArray = ['arrivalStage',
    'greetingStage', 
    'testsStage', 
    'waitResultsStage',
    'resultsStage', 
    'waitDiagnosisStage', 
    'diagnosesStage',
    'successStage',
    'epilogueStage',
    'finalStage']
  for (var k = 0; k<stageArray.length;k++){
    Session.set(stageArray[k], false);
  }
  Session.set(stageArray[i], true);
};

setStatus = function (patient_id) {
  s = Meteor.user().profile.current.status
  p = Patients.findOne({id:patient_id})
  c = p.case[0]
  st = c.status[s]
  Session.set('narratorStatus', st.narrator)
  Session.set('nurseStatus', st.nurse)
  Session.set('patientStatus', st.patient)
  };

// setEpilogueStage = function (patient_id, i) {
//   e = Meteor.user().profile.current.epilogue
//   p = Patients.findOne({id:patient_id})
//   c = p.case[0]
//   ep = c.epilogue[e]

//   Session.set('epQuestion', ep.question)
// };



  //---------------- HELPERS ----------------

  //EMMER EFFIN GOOD HELPER

Handlebars.registerHelper('session',function(input){
  return Session.get(input);
});

Handlebars.registerHelper('epilogue', function(input){
  return Session.get('epStage' + input)
})


  //---------------- TEMPLATES ----------------

  // Template filling like cream, lots of dejudifying to do
  // To dejudify: store patient inside a current.patient field in user
  // & always request it.

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

  Template.statusPanel.patient = function() {
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

  Template.finalPanel.patient = function() {
  if (Patients.findOne({name:"Judy"})) {
    return Patients.findOne({name:"Judy"})
      }
    };

  // think about that one good
  Template.epiloguePanel.epilogue = function() {
    epPhase = Meteor.user().profile.current.epilogue
    ep = Patients.findOne({name:"Judy"}).case[0].epilogue[epPhase]
    return ep
  }


  //---------------- EVENTS ----------------

  Template.newPatient.events({
    'click a.newPatient' : function () {
      patient_id = $('a[class="newPatient arrival"]').attr('id')
      if (!Meteor.user().profile.current.patient) {
        //Meteor.users.update(Meteor.user()._id, {$set:{'profile.current.patient':patient_id}});
        Meteor.call('newPatient', Meteor.user(), patient_id);
      }
      // this adds the current patient being treated to the user profile.
      Meteor.setTimeout(function () {
      stage = stage + 1;
      setStage(stage);
      }, 100);
      //temporary (dev) fix to reset the player statuss
      Meteor.users.update(Meteor.user()._id, {$set:{'profile.current.status':0}})
      setStatus(patient_id);
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
      //goes to diagnosesStage
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
          results.push({'test':   tests[i], 'result':result, 'abnormal': abnormal})
        }
        // Meteor.users.update(Meteor.user()._id, 
        //   {$set:{
        //     'profile.current.investigations':tests,
        //     'profile.current.results':results
        //   }
        // });
        Meteor.call('addCurrentTestsAndResults',
          Meteor.user(),
          tests,
          results)
        //allow to progress in the game
        stage++
        setStage(stage)

        //This is to give a hint: where to click after the investigations, from user feedback.
        Meteor.setTimeout(function(){
          $('a[class="results"]').tooltip('show')
          }, 400);
       
      }
    },

  });


Template.resultsPanel.events({
  //This is to give a hint: where to click after the results
  // Should be systematized 
  'click a.next' : function(){
    Meteor.setTimeout(function(){
          $('a[class="testPatient bed retryTest"]').tooltip('show');
          $('a[class="diag"]').tooltip('show')
          }, 400);
  }
});

  Template.diagnosesPanel.events({ 
    'click a.diagnose' : function() {
      diag = $(":radio:checked").attr('id');
       Meteor.users.update(Meteor.user._id,
      {$set:{'profile.current.diagnoses' : diag}})
      win = Diagnoses.findOne({ $and: [ { name: diag }, { patient_id: "judy" }, { case_id: "judy_first" } ]}).correct
      if (win) {
        Session.set("wrongStage", false)
        Meteor.users.update(Meteor.user()._id, {
          $inc:{'profile.xp':70},
        });
        Meteor.users.update(Meteor.user()._id, {
          $inc:{'profile.reputation':70}
        });
        stage++;
        setStage(stage);
      } else {
        //if wrong diagnosis
        Session.set("wrongStage", true)
        stage++
        setStage(stage)
        Meteor.call('addCurrentDiagnosis',
          Meteor.user(),
          diag  )
        Meteor.users.update(Meteor.user()._id, 
          {
            $inc:{
              'profile.current.status':1
            }});  
        setStatus(Meteor.user().profile.current.patient);
      }
    }
  });

  Template.statusPanel.events({
    'click a.retry':function() {
      //resets to waitDiagnosisStage
      stage = 5
      setStage(stage)
    },

    'click a.epilogue':function(){
      stage = 8
      setStage(stage)
    }

  })

  Template.epiloguePanel.events({
    'click a.answer':function(){
      //checks if epilogue answer is the right one, if not goes to endscreen.
      if (this.next) {
        epPhase ++
        Meteor.users.update(Meteor.user()._id, 
          {
            $inc:{
              'profile.current.epilogue':1
            }}); 
        // success for epilogue: go to finalStage with bonus
        if (epPhase + 1 > Patients.findOne({name:"Judy"}).case[0].epilogue.length) {
          setStage(9);
          Meteor.users.update(Meteor.user()._id, 
          {
            $set:{
              'profile.current.epilogue':0,
              'profile.current.bonus': true,
              'profile.current.message': this.message,
            }});
          Meteor.call('addXPAndReputation',
            Meteor.user(),
            Patients.findOne({name:"Judy"}).case[0].bonus.xp,
            Patients.findOne({name:"Judy"}).case[0].bonus.reputation)
        }
        // failure for epilogue go to finalStage without bonus but with message
      } else {
        Meteor.users.update(Meteor.user()._id, 
        {
          $set:{
            'profile.current.epilogue':0,
            'profile.current.message': this.message,
          }}); 
        setStage(9)
        Meteor.call("pushCurrentToArchive", Meteor.user())
      }
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

//some functions are fiddly, but they should work fine now.
//

Meteor.methods({
  newPatient : function(user, patient_id) {
    Meteor.users.update(user, 
      {$set:{'profile.current.patient':patient_id}})
  },

  addCurrentTestsAndResults : function(user, tests, results) {
    Meteor.users.update(user, 
      {$set:{
        'profile.current.investigations':tests,
        'profile.current.results':results,
      }});
  },

  addCurrentDiagnosis : function (user, diag) {
    Meteor.users.update(user,
      {$set:{
        'profile.current.diagnoses' : diag
      }})
  },

  addXPAndReputation : function (user, xp, rep) {
    Meteor.users.update(user,
      {$inc:{
        'profile.xp': xp,
        'profile.reputation': rep,
      }});
    if (xp>0) {
      
    }
  },

  pushCurrentToArchive : function (user) {
    Meteor.users.update(user,
      {$push:{
        'profile.current.archive': user.profile.current
      }});
  },

  sayHi : function() {
    console.log("hi")
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
          status:0,
          epilogue:0,
          message:null,
          bonus:false,
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
        // need to cut off this into the classes it belongs to.
        case:[{
          name:"judy_first",
          rank:0,
          status:[
            {patient:"My right knee is swollen and more and more painful over the past day. I don’t really know what caused it – I didn’t injure it or anything. I’m 28 years old, generally healthy and taking no medications. This has never happened to me before. A few hours after my knee pain started my hands and wrists are also starting to hurt so much that I can barely do anything!",
            nurse:'',
            narrator:"A young woman enters, she looks in quite some pain."},
            {patient:"My knee hurts so much! What’s going on?",
            nurse:'',
            narrator:"Did you order the right diagnosis and treatment? Repeat or order some new tests."},
            {patient:"My husband is still not here to see me. I think he’s cheating on me.", 
            nurse:'',
            narrator:'Judy is still not getting better. Now both of her knees and ankles are red, hot, and swollen. Her hands and wrists also got worse. Her spirits are quite low.'},
            {patient:"*faints*",
            nurse:"Oh no! Judy is in a life-threatening condition – she has a high fever (40C), very low blood pressure (60/30); she’s breathing extremely fast (30 breaths/minute) and her heart is beating very heart as well (140 beats/minute). A blood culture showed bacterial infection in the blood. She needs fluids, antibiotics, and drugs to help her heart!",
            narrator:"The nurse runs to you."},
            ],
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
          epilogue:[
          {
            rank:0,
            question:"Judy asks you, “What could have caused this? I really have no clue, all of a sudden this happened!” Judy’s husband Marc finally got to her bedside. He had been very busy since getting back from his business trip. He asks if it would be okay to speak to you in private.",
            answers:[
            {
              answer:"Yes",
              next:true,
              message:""
            },
            {
              answer:"No",
              next:false,
              message:"Judy is discharged."
            }]
          },
          {
            rank:1,
            question:"Marc says he slept with a prostitute while he was away at a business trip, and didn't use any protection. He's been having a bit of discharge from his penis lately. He asks if something sexually transmitted could have caused his wife’s suffering?",
            answers:[
            {
              answer:"Yes",
              next:true,
              message:"Some STDs, in this case gonorrhea, can lead to symptoms in the joints. Always ask about sexual history when someone has an acute joint pain. Here are some bonus reputation points for a job well jobbed! Before discharging Judy, you give her the address of a good marriage counselor."
            },
            {
              answer:"No",
              next:false,
              message:"Wrong. Some STDs, in this case gonorrhea, can lead to symptoms in the joints. Always ask about sexual history when someone has an acute joint pain."
            }]
          },

          ],
          success:"Congratulations, Judy feels much better!",
          win:{
            reputation:70,
            xp:70,
          },
          bonus:{ 
            message:"",
            reputation:100,
            xp:20,
          },
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

