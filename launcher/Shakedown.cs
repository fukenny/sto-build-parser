using System;
using System.Diagnostics;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Windows.Forms;

[assembly: System.Reflection.AssemblyTitle("STO Shakedown")]
[assembly: System.Reflection.AssemblyProduct("STO Shakedown")]
[assembly: System.Reflection.AssemblyVersion("0.6.0.0")]
internal static class Shakedown
{
    [STAThread]
    private static int Main(string[] args)
    {
        bool check = Array.IndexOf(args, "--check-runtime") >= 0;
        bool smoke = Array.IndexOf(args, "--smoke-test") >= 0;
        string root = AppDomain.CurrentDomain.BaseDirectory;
        string node = Path.Combine(root, "runtime", "node.exe");
        string server = Path.Combine(root, "server.mjs");
        try
        {
            if (!File.Exists(node) || !File.Exists(server))
                throw new IOException("Extract the complete Shakedown ZIP before launching. Keep Shakedown.exe beside server.mjs and the runtime folder.");
            string identity;
            using (var hash = SHA256.Create())
                identity = BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(root.ToUpperInvariant()))).Replace("-", "");
            using (var mutex = new Mutex(false, "Local\\STOShakedown-" + identity))
            {
                bool held;
                try { held = mutex.WaitOne(0); }
                catch (AbandonedMutexException) { held = true; }
                if (!held)
                {
                    if (!check && !smoke) MessageBox.Show("Shakedown is already running from this folder. Use its open browser tab. Close that tab and wait 15 seconds before launching again.", "STO Shakedown", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    return 2;
                }
                try
                {
                    var start = new ProcessStartInfo(node, check ? "--version" : "\"" + server + "\"" + (smoke ? "" : " --open"));
                    start.WorkingDirectory = root;
                    start.UseShellExecute = false;
                    start.CreateNoWindow = true;
                    start.RedirectStandardOutput = true;
                    start.RedirectStandardError = true;
                    // An ephemeral loopback port avoids conflicts with another installation.
                    start.EnvironmentVariables["PORT"] = "0";
                    // Keep portable saves with this package; do not inherit a developer override.
                    start.EnvironmentVariables["STO_DATA_DIR"] = Path.Combine(root, "data");
                    if (smoke) { start.EnvironmentVariables["STO_STARTUP_TIMEOUT_MS"] = "1500"; start.EnvironmentVariables["STO_DATA_DIR"] = Path.Combine(root, "build", "launcher-smoke-data"); }
                    bool ready = false;
                    var errors = new StringBuilder();
                    using (var process = new Process { StartInfo = start })
                    {
                        process.OutputDataReceived += delegate(object sender, DataReceivedEventArgs e) { if (e.Data != null && e.Data.StartsWith("STO Shakedown private launch")) ready = true; /* Never persist the private launch URL. */ };
                        process.ErrorDataReceived += delegate(object sender, DataReceivedEventArgs e) { if (e.Data != null) lock (errors) { if (errors.Length < 8000) errors.AppendLine(e.Data); } };
                        process.Start();
                        process.BeginOutputReadLine();
                        process.BeginErrorReadLine();
                        process.WaitForExit();
                        if (smoke && !ready) return 1;
                        if (process.ExitCode != 0) throw new IOException("Shakedown could not run. Your saved data has not been removed.\n\n" + errors.ToString());
                    }
                    return 0;
                }
                finally { mutex.ReleaseMutex(); }
            }
        }
        catch (Exception e)
        {
            if (!check && !smoke) MessageBox.Show(e.Message, "STO Shakedown — startup problem", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
    }
}
