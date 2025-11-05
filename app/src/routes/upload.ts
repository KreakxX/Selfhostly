import Elysia, { t } from "elysia";
import fs from "fs"
import path from "path"
import { exec } from "child_process";
import AdmZip from "adm-zip";

export const uploadRoutes = new Elysia({prefix: "/upload"})
.post("/upload", async({body}) =>{
  const file = body.file as File

  const projectName = file.name.split(".")[0];

  const projectPath = path.join("projects", projectName)
  fs.mkdirSync(projectPath, { recursive: true });
  fs.mkdirSync("temp", { recursive: true });

  const tempPath = path.join("temp", file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(tempPath, buffer);
  
  const zip = new AdmZip(tempPath);
  zip.extractAllTo(projectPath, true); 
  
  const possibleBuildDirs = ["build", "out"];
  for (const dir of possibleBuildDirs) {
      const buildPath = path.join(projectPath, dir);
      if (fs.existsSync(buildPath)) {
          const files = fs.readdirSync(buildPath);
          for (const fileName of files) {
              const src = path.join(buildPath, fileName);
              const dest = path.join(projectPath, fileName);
              fs.renameSync(src, dest); 
          }
          fs.rmdirSync(buildPath, { recursive: true });
          break; 
      }
  }
  
  fs.unlinkSync(tempPath);
  
  const caddyConfig = `
  :8080 {
      root * C:\\Users\\Henri\\Videos\\selfhostly\\app\\projects\\${projectName}
      file_server
      try_files {path} /index.html
  }
`

  fs.writeFileSync(path.join(__dirname, "../caddy/Caddyfile"), caddyConfig)
  const caddyExe = "C:\\Program Files\\Caddy\\caddy.exe";
  const caddyfilePath = path.resolve(__dirname, "../caddy/Caddyfile");

  exec(`"${caddyExe}" reload --config "${caddyfilePath}"`, (err, stdout, stderr) => {
    if(err) console.error("Caddy reload error:", err)
    else console.log("Caddy reloaded:", stdout)
  })

  return {success: true, done: true}
},{
  body: t.Object({
    file: t.File()
  })
})

