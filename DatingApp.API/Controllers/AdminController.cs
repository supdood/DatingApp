using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController: ControllerBase
    {
        private readonly DataContext _context;
        private readonly UserManager<User> _userManager;
        private readonly IDatingRepository _repo;
        private readonly IMapper _mapper;

        public AdminController(DataContext context, UserManager<User> userManager, IDatingRepository repo, IMapper mapper)
        {
            _context = context;
            _userManager = userManager;
            _repo = repo;
            _mapper = mapper;
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpGet("usersWithRoles")]
        public async Task<IActionResult> GetUsersWithRoles()
        {
            var userList = await (from user in _context.Users
                orderby user.UserName
                select new
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Roles = (from userRole in user.UserRoles
                        join role in _context.Roles
                            on userRole.RoleId
                            equals role.Id
                        select role.Name).ToList()
                }).ToListAsync();
            return Ok(userList);
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("editRoles/{userName}")]
        public async Task<IActionResult> EditRoles(string userName, RoleEditDto roleEditDto)
        {
            var user = await _userManager.FindByNameAsync(userName);
            var userRoles = await _userManager.GetRolesAsync(user);

            var selectedRoles = roleEditDto.RoleNames;

            selectedRoles = selectedRoles ?? new string[] { };
            var result = await _userManager.AddToRolesAsync(user, selectedRoles.Except(userRoles));

            if (!result.Succeeded)
            {
                return BadRequest("Failed to add to roles");
            }

            result = await _userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRoles));

            if (!result.Succeeded)
            {
                return BadRequest("Failed to removed roles");
            }

            return Ok(await _userManager.GetRolesAsync(user));
        }

        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpGet("photosForModeration")]
        public async Task<IActionResult> GetPhotosForModeration()
        {
            var photos = await _repo.GetUnapprovedPhotos();
            var photosForReturn = _mapper.Map<IEnumerable<PhotoForApprovalDto>>(photos);
            return Ok(photosForReturn);
        }

        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpPut("photosForModeration/{id}")]
        public async Task<IActionResult> ApprovePhoto(int id)
        {
            var photoFromRepo = await _repo.GetPhoto(id);

            photoFromRepo.IsApproved = true;

            if (await _repo.SaveAll())
            {
                return NoContent();
            }
            throw new Exception("Failed to approve photo");
        }
    }
}
