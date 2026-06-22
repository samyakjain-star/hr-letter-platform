import { IpcMain, BrowserWindow } from 'electron'
import nodemailer from 'nodemailer'
import type { MailJob, SmtpConfig, SendProgress } from '../../renderer/src/types'

function createTransport(cfg: SmtpConfig) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.email, pass: cfg.appPassword },
    tls: { rejectUnauthorized: false }
  })
}

export function registerMailHandlers(
  ipcMain: IpcMain,
  getWindow: () => BrowserWindow | null
): void {
  ipcMain.handle('mail:test-connection', async (_e, cfg: SmtpConfig) => {
    try {
      const transporter = createTransport(cfg)
      await transporter.verify()
      return { ok: true }
    } catch (err: unknown) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle('mail:send-batch', async (_e, cfg: SmtpConfig, jobs: MailJob[]) => {
    const transporter = createTransport(cfg)
    const win = getWindow()

    for (const job of jobs) {
      const progress: SendProgress = { rowIndex: job.rowIndex, status: 'sent' }
      try {
        const attachments =
          job.attachmentBase64 && job.attachmentName
            ? [
                {
                  filename: job.attachmentName,
                  content: Buffer.from(job.attachmentBase64, 'base64'),
                  contentType: 'application/pdf'
                }
              ]
            : []

        await transporter.sendMail({
          from: cfg.email,
          to: job.to,
          cc: job.cc,
          bcc: job.bcc,
          subject: job.subject,
          html: job.html,
          attachments
        })
      } catch (err: unknown) {
        progress.status = 'failed'
        progress.error = err instanceof Error ? err.message : String(err)
      }

      // Push progress to renderer
      win?.webContents.send('mail:send-progress', progress)
    }
  })
}
