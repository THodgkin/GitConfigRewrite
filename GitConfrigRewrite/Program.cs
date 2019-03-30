using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GitConfrigRewrite
{
    class Program
    {
        static void Main(string[] args)
        {
            string path = "C:\\ProgramData\\Git\\";
            string file = "config";
            string filePath = path + file;
            if (validPath(path) == true)
            {
                string fileText = File.ReadAllText(filePath);
                fileText = fileText +
                    "[http]\n" +
                    "\tproxy = \"http://proxyg.slhs.org:8080\"";
                File.WriteAllText(filePath, fileText);

                Console.WriteLine("config file has been sucessfully updated. (Press any key to exit.)");
                Console.ReadKey();
            }
            else
            {
                Console.WriteLine("The needed path {0} does not exist. Usually this is an indicator that you have not yet installed Git for Windows.\n" +
                    "Please review documentation on how to install Git for Windows. (Press any key to exit.)", path);
                Console.ReadKey();
            }
            
        }

        private static bool validPath(string path)
        {
            return Directory.Exists(path);
        }
    }
}
