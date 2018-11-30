using System;
using System.Linq;
using AutoMapper;
using DatingApp.API.Dtos;
using DatingApp.API.Models;

namespace DatingApp.API.Helpers
{
    public class AutoMapperProfiles: Profile
    {
        public AutoMapperProfiles()
        {
            CreateMap<User, UserForListDto>()
                .ForMember(dest => dest.PhotoUrl, opt => {
                    opt.MapFrom(src => src.Photos.FirstOrDefault(p => p.IsMain).Url);
                })
                .ForMember(dest => dest.Age, opt => {
                    opt.ResolveUsing(d => d.DateOfBirth.CalculateAge());
                })
                .ForMember(d => d.Liked, opt =>
                {
                    opt.ResolveUsing((src, dest, destMember, resContext) =>
                    {
                        return src.Likers.Any(like => like.LikerId == (int)resContext.Items["userId"]);
                    });
                });
            CreateMap<User, UserForDetailedDto>()
                .ForMember(dest => dest.PhotoUrl, opt => {
                    opt.MapFrom(src => src.Photos.FirstOrDefault(p => p.IsMain).Url);
                })
                .ForMember(dest => dest.Age, opt => {
                    opt.ResolveUsing(d => d.DateOfBirth.CalculateAge());
                })
                .ForMember(d => d.Liked, opt =>
                {
                    opt.ResolveUsing((src, dest, destMember, resContext) =>
                    {
                        return src.Likers.Any(like => like.LikerId == (int)resContext.Items["userId"]);
                    });
                });
            CreateMap<Photo, PhotoForDetailedDto>();
            CreateMap<UserForUpdateDto, User>();
            CreateMap<Photo, PhotoForReturnDto>();
            CreateMap<PhotoForCreationDto, Photo>();
            CreateMap<UserForRegisterDto, User>();
        }
    }
}