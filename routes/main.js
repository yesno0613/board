const express = require('express')
const router = express.Router();
var moment = require("moment");
var mysql = require("mysql2");
require('dotenv').config();

var connection = mysql.createConnection({
    host : process.env.host,  //127,0,0,1
    port : process.env.port,
    user : process.env.user,
    password : process.env.password,
    database : process.env.database
  });

  router.get("/", function(req, res, next){
      if(!req.session.logged){
          res.redirect("/")
      }else{
      connection.query(
          `select * from board`,
          function(err, result){
              if(err){
                  console.log(err);
                  res.send("select Error")
              }else{
                //   console.log(result);
                //   console.log(result.length);
                //   res.send(result);
                  res.render('index', {
                      content : result,
                      name : req.session.logged.name,
                  })
              }
          }
      )
        }
  })

  router.get("/add", function(req, res, next){
      if(!req.session.logged){
          res.redirect("/")
      }else
      res.render('add');
  })

  router.post("/add_2", function(req, res, next){
      var title = req.body.title;
      var content = req.body.content;
      var img = req.body.img;
    //   var author = req.body.author;
      var date = moment().format("YYYYMMDD");
      var time = moment().format("hhmmss");
      console.log(title, content);
      var author = req.session.logged.name;
      var post_id = req.session.logged.post_id;
      connection.query(
          `insert into board(title, content, img, date, time, author, post_id) values (?, ?, ?, ?, ?, ?, ?)`,
          [title, content, img, date, time, author, post_id],
          function(err, result){
              if(err){
                  console.log(err);
                //   console.log("title")
                  res.send("add insert Error")
              }else{
                  res.redirect("/board")
              }
          }
      )
        
  })

  router.get("/info", function(req, res, next){
    if(!req.session.logged){
        res.redirect("/")
    }else{
    var no = req.query.no;
    console.log(no);
    connection.query(
        `select * from board where No = ?`,
        [no],
        function(err, result){
            if(err){
                console.log(err)
                res.send("info select Error")
            }else{
                connection.query(
                    `select * from comment where parent_num = ?`,
                    [no],
                    function(err2,result2){
                        if(err2){
                            console.log(err2);
                            res.send("게시글의 댓글 출력 에러")
                        }else{
                            console.log(result);
                            console.log(result2.length);
                            console.log(req.session.logged.post_id);
                            res.render('info',{
                                content : result,
                                opinion : result2,
                                post_id : req.session.logged.post_id,
                                name : req.session.logged.name,
                            })
                        }
                    }
                )
            }
        }
    )
    }
  })

  router.get("/del", function(req, res, next){
    if(!req.session.logged){
        res.redirect("/")
    }else{
      var no = req.query.no;
      console.log(no);
      connection.query(
          `delete from board where No = ?`,
          [no],
          function(err, result){
              if(err){
                  console.log(err);
                  res.send("delete Error")
              }else{
                  res.redirect("/board")
              }
          }
      )
        }
  })

  router.get("/update", function(req, res, next){
    if(!req.session.logged){
        res.redirect("/")
    }else{
      var no = req.query.no;
      console.log(no);
      connection.query(
          `select * from board where No = ?`,
          [no],
          function(err, result){
              if(err){
                  console.log(err);
                  res.send("update select Error")
              }else{
                  res.render('update', {
                      content : result
                  })
              }
          }
      )
        }
  })

  router.post("/update_2", function(req, res, next){
      var no = req.body.no;
      var title = req.body.title;
      var content = req.body.content;
      connection.query(
          `update board set title = ?, content = ? where No = ? `,
          [title, content, no],
          function(err, result){
              if(err){
                  console.log(err);
                  res.send("update_2 update Error")
              }else{
                  res.redirect("/board")
              }
          }
      )
  })


router.post("/add_comment", function(req,res ,next){
    if(!req.session.logged){
        res.redirect("/")
    }else{
        var no = req.body.no;
        var comment = req.body.comment;
        var post_id = req.session.logged.post_id;
        var name = req.session.logged.name;
        var date = moment().format("YYYYMMDD");
        var time = moment().format("HHMMSS");
        console.log(no, comment, post_id, name ,date, time);
        connection.query(
            `insert into comment(parent_num, opinion, post_id, name, date, time) values (?, ?, ?, ?, ?, ?) `,
            [no, comment, post_id, name, date, time],
            function(err, result){
                if(err){
                    console.log(err);
                    res.sand( "댓글 추가 실패")
                }else{
                    res.redirect("/board/info?no="+no);

                }
            }
        )
    }
    
})

//parmas 사용 방법
router.get("/comment_del/:no/:parent_num", function(req, res, next){
    var no = req.parmas.no;//댓글 번호
    var parent_num = req.parmas.parent_num;          
    connection.query(
        `delete from comment where No =?`,
        [no],
        function(err, result){
            if(err){
                console.log(err);
                res.render("send", {
                    message : "댓글 삭제 에러"
                })
            }else{
                res.redirect("/board/info?no="+parent_num);
            }
        }
    )
})

router.get ("/comment_like", function(req,res,next){
    var no = req.query.No;
    var parent_num = req.query.parent_num;
    var up = req.query.up;
    up=parseInt(up)+1;
    console.log(no, parent_num, up);
    connection.query(
        `UPDATE comment SET up = ? where No = ?`,
        [up, no],
        function(err, result){
            if(err){
                console.log(err);
                res.render("error",{ 
                    message : "좋아요 추가 에러"
                })   
            }else{
                res.redirect("/board/info?no="+parent_num);
            }
        }
    )
})

router.get ("/comment_hate", function(req,res,next){
    var no = req.query.No;
    var parent_num = req.query.parent_num;
    var down = req.query.down;
    down=parseInt(down)+1;
    console.log(no, parent_num, down);
    connection.query(
        `UPDATE comment SET down = ? where No = ?`,
        [down, no],
        function(err, result){
            if(err){
                console.log(err);
                res.render("error",{ 
                    message : "좋아요 추가 에러"
                })   
            }else{
                res.redirect("/board/info?no="+parent_num);
            }
        }
    )
})
  module.exports = router;