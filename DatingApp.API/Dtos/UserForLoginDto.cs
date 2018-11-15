using System.ComponentModel.DataAnnotations;

namespace DatingApp.API.Dtos
{
    public class UserForLoginDto
    {
        [Required]
        public string Username { get; }
        [Required]
        public string Password { get; set; }

        public UserForLoginDto(string username)
        {
            Username = username.ToLower();
        }
    }
}