using System.Collections.Generic;
using System.Linq;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Identity;
using Newtonsoft.Json;

namespace DatingApp.API.Data
{
    public class Seed
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;

        public Seed(UserManager<User> userManager, RoleManager<Role> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public void SeedUsers()
        {
            var userData = System.IO.File.ReadAllText("Data/UserSeedData.json");
            var users = JsonConvert.DeserializeObject<List<User>>(userData);

            var roles = new List<Role>
            {
                new Role() {Name = "Member"},
                new Role() {Name = "Admin"},
                new Role() {Name = "Moderator"},
                new Role() {Name = "VIP"}
            };

            foreach (var role in roles)
            {
                _roleManager.CreateAsync(role).Wait();
            }

            if (_userManager.Users.Any()) return;
            foreach (var user in users)
            {
                user.Photos.SingleOrDefault().IsApproved = true;
                _userManager.CreateAsync(user, "password").Wait();
                _userManager.AddToRoleAsync(user, "Member").Wait();
            }

            var adminUser = new User()
            {
                UserName = "Admin"
            };

            var result = _userManager.CreateAsync(adminUser, "admin").Result;

            if (result.Succeeded)
            {
                var admin = _userManager.FindByNameAsync("Admin").Result;
                _userManager.AddToRolesAsync(admin, new[] {"Admin", "Moderator"}).Wait();
            }
        }

        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using(var hmac = new System.Security.Cryptography.HMACSHA512()) 
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            }
        }
    }
}