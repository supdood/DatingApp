using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using DatingApp.API.Helpers;

namespace DatingApp.API.Attributes
{
    public class DateRange : RangeAttribute
    {
        public DateRange(): base(typeof(DateTime), DateTime.Now.AddYears(-99).ToShortDateString(), DateTime.Now.AddYears(-18).ToShortDateString()) {}
    }
}
