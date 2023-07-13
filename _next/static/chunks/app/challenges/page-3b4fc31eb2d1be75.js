(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[395],{588:function(e,s,r){Promise.resolve().then(r.bind(r,8381)),Promise.resolve().then(r.bind(r,2207)),Promise.resolve().then(r.bind(r,9962))},2207:function(e,s,r){"use strict";r.r(s),r.d(s,{default:function(){return i}});var t=r(9268),n=r(4821);function i(e){let s=e.challenges.slice().sort((e,s)=>e.createdAt.getTime()-s.createdAt.getTime()),r=0,i=[];for(let e of s)r=Math.max(r,Number(e.score)),i.push({score:r,createdAt:e.createdAt.toISOString()});return(0,t.jsxs)(n.Zb,{className:"mt-8",children:[(0,t.jsx)(n.Dx,{children:"Max Score History"}),(0,t.jsx)(n.xv,{children:"X 軸の間隔は適当 / Challenge のスコア遷移 (対象を絞った場合影響無し)"}),(0,t.jsx)(n.wW,{className:"mt-6 h-80",data:i,index:"createdAt",colors:["indigo"],categories:["score"]})]})}},8381:function(e,s,r){"use strict";r.r(s),r.d(s,{default:function(){return a}});var t=r(9268),n=r(4821);function i(e){let{challenges:s}=e;return(0,t.jsxs)(n.iA,{children:[(0,t.jsx)(n.ss,{children:(0,t.jsxs)(n.SC,{children:[(0,t.jsx)(n.xs,{children:"ID"}),(0,t.jsx)(n.xs,{className:"text-right",children:"Tag"}),(0,t.jsx)(n.xs,{className:"text-right",children:"Args"}),(0,t.jsx)(n.xs,{className:"text-right",children:"CreatedAt"}),(0,t.jsx)(n.xs,{className:"text-right",children:"Commit ID"}),(0,t.jsx)(n.xs,{className:"text-right",children:"Target"}),(0,t.jsx)(n.xs,{className:"text-right",children:"Solved"}),(0,t.jsx)(n.xs,{className:"text-right",children:"Failed"}),(0,t.jsx)(n.xs,{className:"text-right",children:"Score"})]})}),(0,t.jsx)(n.RM,{children:s.map(e=>(0,t.jsxs)(n.SC,{children:[(0,t.jsx)(n.pj,{children:(0,t.jsx)("a",{href:"".concat("/icfpc2023","/challenges/").concat(e.id,".html"),children:e.id})}),(0,t.jsx)(n.pj,{className:"text-right",children:e.tag}),(0,t.jsx)(n.pj,{className:"text-left",children:e.args}),(0,t.jsx)(n.pj,{className:"text-right",children:e.createdAt.toISOString()}),(0,t.jsx)(n.pj,{className:"text-right",children:(0,t.jsx)("a",{href:"https://github.com/seikichi/icfpc2023/commit/".concat(e.commitId),children:e.commitId})}),(0,t.jsx)(n.pj,{className:"text-right",children:e.target}),(0,t.jsx)(n.pj,{className:"text-right",children:e.solved}),(0,t.jsx)(n.pj,{className:"text-right",children:e.failed}),(0,t.jsx)(n.pj,{className:"text-right",children:Number(e.score)})]},e.id))})]})}function a(e){return(0,t.jsxs)(n.v0,{className:"mt-6",children:[(0,t.jsxs)(n.td,{children:[(0,t.jsx)(n.OK,{children:"Best"}),(0,t.jsx)(n.OK,{children:"Recent"})]}),(0,t.jsxs)(n.nP,{children:[(0,t.jsx)(n.x4,{children:(0,t.jsx)("div",{className:"mt-6",children:(0,t.jsx)(n.Zb,{children:(0,t.jsx)(i,{challenges:e.bestChallenges})})})}),(0,t.jsx)(n.x4,{children:(0,t.jsx)("div",{className:"mt-6",children:(0,t.jsx)(n.Zb,{children:(0,t.jsx)(i,{challenges:e.recentChallenges})})})})]})]})}},9962:function(e,s,r){"use strict";r.r(s),r.d(s,{default:function(){return l}});var t=r(9268),n=r(209),i=r(4821),a=r(9700),c=r(7830);function l(){var e,s,r;let{register:l,handleSubmit:d,formState:{errors:h,isSubmitting:x},reset:m}=(0,a.cI)({resolver:(0,c.F)(n.Hg)}),o=async e=>{m(),alert("\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8")};return(0,t.jsx)(i.Zb,{className:"mt-8",children:(0,t.jsxs)("form",{onSubmit:d(o),children:[(0,t.jsx)(i.Dx,{children:"Submit"}),(0,t.jsx)(i.xv,{children:"コンテスト後追記: コンテスト中はここで Submit すると AWS Lambda でソルバーが実行されました"}),(0,t.jsxs)("div",{className:"space-y-4 mt-8",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)(i.xv,{children:"TAG (alphabet, number, hyphen)"}),(0,t.jsx)(i.oi,{placeholder:"seikichi-test",error:!!h.tag,errorMessage:null===(e=h.tag)||void 0===e?void 0:e.message,...l("tag")})]}),(0,t.jsxs)("div",{children:[(0,t.jsxs)(i.xv,{children:["Args (e.g.,"," ",(0,t.jsx)("code",{children:"-a GridGreed,Annealing --annealing-seconds 300"}),")"]}),(0,t.jsx)(i.oi,{placeholder:"-a GridGreed,Annealing --annealing-seconds 300",error:!!h.args,errorMessage:null===(s=h.args)||void 0===s?void 0:s.message,...l("args")})]}),(0,t.jsxs)("div",{children:[(0,t.jsxs)(i.xv,{children:["Target (e.g., ",(0,t.jsx)("code",{children:"1-90"})," or ",(0,t.jsx)("code",{children:"1-5,10-20"}),")"]}),(0,t.jsx)(i.oi,{placeholder:"1-90",error:!!h.target,errorMessage:null===(r=h.target)||void 0===r?void 0:r.message,...l("target")})]})]}),(0,t.jsx)(i.kC,{justifyContent:"end",className:"space-x-2 border-t pt-4 mt-8",children:(0,t.jsx)(i.zx,{size:"xs",disabled:x,children:"Submit"})})]})})}},209:function(e,s,r){"use strict";r.d(s,{Hg:function(){return i},WQ:function(){return n}});var t=r(2391);t.z.object({DATABASE_URL:t.z.string().startsWith("mysql://"),AUTH_USER:t.z.string().optional(),AUTH_PASSWORD:t.z.string().optional(),AWS_ACCESS_KEY_ID:t.z.string().startsWith("AKIA"),AWS_SECRET_ACCESS_KEY:t.z.string().min(1),AWS_DEFAULT_REGION:t.z.string().min(1),SOLVER_LAMBDA_ARN:t.z.string().startsWith("arn:aws:lambda:"),CHALLENGE_LAMBDA_ARN:t.z.string().startsWith("arn:aws:lambda:"),BUCKET:t.z.string().min(1),API_TOKEN:t.z.string().min(1)}),t.z.object({room_width:t.z.number().gt(0),room_height:t.z.number().gt(0),stage_width:t.z.number().gt(0),stage_height:t.z.number().gt(0),stage_bottom_left:t.z.tuple([t.z.number().min(0),t.z.number().min(0)]),musicians:t.z.number().min(0).array().min(1),attendees:t.z.object({x:t.z.number(),y:t.z.number(),tastes:t.z.number().array().min(1)}).array().min(1),pillars:t.z.object({center:t.z.tuple([t.z.number().min(0),t.z.number().min(0)]),radius:t.z.number().min(0)}).array().min(0).optional()});let n=t.z.object({placements:t.z.object({x:t.z.number(),y:t.z.number()}).array().min(1)}),i=t.z.object({tag:t.z.string().min(1).max(16).regex(/^[a-zA-Z0-9\-]*$/),args:t.z.string().min(1).max(256),target:t.z.string().min(1).max(32).regex(/^([1-9][0-9]*(-[1-9][0-9]*)?)(,([1-9][0-9]*(-[1-9][0-9]*)?))*$/)})}},function(e){e.O(0,[795,391,830,253,769,744],function(){return e(e.s=588)}),_N_E=e.O()}]);