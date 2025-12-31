// transparent menu bar scroll
const menuBar = document.getElementById('menu-scroll');

// Check the initial scroll position and set the visibility accordingly
if (window.scrollY > 50) {
  menuBar.classList.add('scrolled');
} else {
  menuBar.classList.remove('scrolled');
}

// Add an event listener for the scroll event
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) { 
    menuBar.classList.add('scrolled');
  } else {
    menuBar.classList.remove('scrolled');
  }
});// end of trnasparent menu code


/* small screen menu displayer */
// Show or hide the menu
// Menu toggle for small screens
const showMenu = (toggleId, navId) => {
    const toggle = document.getElementById(toggleId);
    const nav = document.getElementById(navId);
  
    toggle.addEventListener('click', () => {
      // Toggle the 'active' class for menu visibility
      nav.classList.toggle('active');
      // Toggle the 'show-icon' class for changing the menu button icon
      toggle.classList.toggle('show-icon');
    });
  };
  
  // Initialize the menu toggle function
  showMenu('nav-toggle', 'menu-bar-id');
  // end of menu toggle 

// Function to run code only on screens <= 767.98px
function runDropdownLogic() {
    if (window.matchMedia("(max-width: 1199.98px)").matches) {
        document.addEventListener("DOMContentLoaded", () => {
            // Target only the Services dropdown
            const servicesDropdown = document.querySelector(".services > .menu-list");
            const servicesLi = servicesDropdown.parentElement;

            servicesDropdown.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const submenu = servicesDropdown.nextElementSibling;
                const arrowIcon = servicesDropdown.querySelector('.dropdown-arrow');

                // Toggle Services dropdown
                const wasOpen = servicesLi.classList.contains('open');
                servicesLi.classList.toggle('open');
                submenu?.classList.toggle('active');

                // Rotate chevron icon
                if (servicesLi.classList.contains('open')) {
                    arrowIcon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                } else {
                    arrowIcon.classList.replace('fa-chevron-up', 'fa-chevron-down');
                    
                    // Close all nested submenus when closing Services
                    closeAllSubmenus(servicesLi);
                }
            });

            // Handle submenu groups inside Services only
            const strongHeaders = servicesLi.querySelectorAll(".submenu-group strong");
            strongHeaders.forEach(strong => {
                strong.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const submenu = strong.nextElementSibling;
                    const icon = strong.querySelector('i');
                    const parentGroup = strong.closest('.submenu-group');

                    // Close other open submenus in the same Services dropdown
                    servicesLi.querySelectorAll(".submenu-group").forEach(group => {
                        if (group !== parentGroup) {
                            const otherStrong = group.querySelector('strong');
                            const otherSubmenu = otherStrong.nextElementSibling;
                            const otherIcon = otherStrong.querySelector('i');
                            
                            otherStrong.classList.remove('active');
                            otherSubmenu.classList.remove('active');
                            otherIcon.classList.replace('fa-minus', 'fa-plus');
                        }
                    });

                    // Toggle current submenu
                    const isOpening = !strong.classList.contains('active');
                    strong.classList.toggle('active', isOpening);
                    submenu.classList.toggle('active', isOpening);
                    
                    // Toggle plus/minus icon
                    if (isOpening) {
                        icon.classList.replace('fa-plus', 'fa-minus');
                    } else {
                        icon.classList.replace('fa-minus', 'fa-plus');
                    }
                });
            });

            // Helper function to close all submenus
            function closeAllSubmenus(container) {
                container.querySelectorAll('.submenu-group strong, .submenu-group .submenu-list').forEach(element => {
                    element.classList.remove('active');
                });
                container.querySelectorAll('.fa-minus').forEach(icon => {
                    icon.classList.replace('fa-minus', 'fa-plus');
                });
            }
            
            // Close dropdowns when clicking outside
            document.addEventListener('click', (e) => {
                if (!servicesLi.contains(e.target)) {
                    servicesLi.classList.remove('open');
                    servicesLi.querySelector('.services-sub-menu')?.classList.remove('active');
                    servicesDropdown.querySelector('.dropdown-arrow')?.classList.replace('fa-chevron-up', 'fa-chevron-down');
                    closeAllSubmenus(servicesLi);
                }
            });
        });
    }
}
  
  // Run on load and resize
  runDropdownLogic();
  window.addEventListener('resize', runDropdownLogic);

  