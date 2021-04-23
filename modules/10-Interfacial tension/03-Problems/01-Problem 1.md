
These problems are appropriate for students in an undergraduate/graduate thermodynamics or physical chemistry course.  The Level 1 questions are well-defined tasks, whereas the Level 2 questions are designed to be more open-ended.


## Level 1 
**(a)** Use the interfacial tension module to calculate the coexisting (vapor and liquid) densities of the fluid at the following temperatures: 0.80, 0.90, 1.00, 1.05, 1.10, 1.15, 1.18, 1.20, and 1.22.  Use the default simulation parameters (with no surfactants).  At each temperature, also record the value of the surface tension (at equilibrium).  As you perform these simulations, examine the configuration panel at each temperature.  You will notice that the width of the liquid phase begins to shrink as the temperature increases.  If you change the default simulation parameters (box size and number of molecules), you can increase the size of the liquid phase.  Although this will make the simulation slower, it will help improve the quality of the results at the higher temperatures (> 1.0).  At temperatures of 1.18 and above, you may not be able to maintain two distinct phases, even with larger simulation sizes.  *From your simulation data (only those with stable vapor and liquid phases), construct two plots, one showing the vapor and liquid densities (x-axis) at each temperature (y-axis), and the other plot showing the interfacial tension (y-axis) as a function of temperature (x-axis).*



**(b)** The temperature at which the two distinct phases (vapor and liquid) become one phase is known as the critical temperature.  Your data and figures from part (a) provide an estimate of the critical temperature.  However, it likely underestimates the value of the true critical temperature, due to the finite simulation size limitations.  You can improve your estimate by fitting your density and surface tension values to standard thermodynamic relationships.  First, using your density data, you can extract the critical density ($\rho_c$) and critical temperature ($T_c$) using the law of rectilinear diameters (using a critical exponent of $\beta$=0.325, with *A* and *B* as adjustable parameters):



$\displaystyle \rho_l^* - \rho_v^* = B(T^* - T_c^*)^{\beta}$ &nbsp; &nbsp; &nbsp; &nbsp; Equation (12)


$\frac{\rho_l^* + \rho_v^*}{2}=\rho_c+A(T^*-T_c^*)$ &nbsp; &nbsp; &nbsp; &nbsp; Equation (13)



Also, you can use the interfacial tension to extrapolate the critical temperature using the relationship below.  By fitting your interfacial tension data to this expression (with $2\nu$=1.26 [[6]](Interfacial_tension/References#ref_ferrenberg),[[7]](Interfacial_tension/References#ref_chen)), you can estimate the temperature at which the interfacial tension becomes zero (which coincides with the critical temperature of the fluid).



$\displaystyle \gamma = \gamma_0 (1-T^*/T_c^*)^{2\nu}$ &nbsp; &nbsp; &nbsp; &nbsp; Equation (14)



*Report your estimates of the critical temperature (using both methods) and the critical density (using the first method).*



**(c)** In these calculations, you can also calculate the approximate vapor pressure corresponding to each temperature.  This can be obtained by using the virial profile of the system.  The pressure can be obtained from the following expression:



$P^*=\rho^*T^* + \frac{Vir(x) + Vir(y) + Vir(z)}{3V^*}$ &nbsp; &nbsp; &nbsp; &nbsp; Equation (15)



For instance, you can acquire the vapor phase density from the density profile plot, and you can obtain the virial components (in the vapor phase) from the virial profile plot.  You can use this route to calculate the pressure in both the liquid phase and the vapor phase.  *Using this approach, calculate the pressure in both phases (liquid and vapor) at each temperature and compare your values.  Should they be the same, or can they be different?  If they are different, which one represents the true value of the vapor pressure at each temperature?*



**(d)** The critical pressure ($P_c$) can be calculated by finding the pressure corresponding to the critical temperature.  Although you cannot directly simulate the system at its critical point, you can use the Clausius-Clapyeron equation to extrapolate the pressure to its value at the critical temperature.  *Use the Clausius-Clapyeron equation (shown below) to fit your simulated vapor pressure data, and use it to predict the critical pressure of the fluid.*



$lnP^*=A+\frac{B}{T^*}$ &nbsp; &nbsp; &nbsp; &nbsp; Equation (16) 



**(e)** The width of the interface tends to increase as the temperature of the system increases.  *Plot the interfacial width as a function of the temperature.*  At the higher temperatures, you may need to experiment with larger simulation sizes, since the larger interfacial widths may not be accommodated with the default simulation size.

## Level 2

**(a)** Compare your simulated results from above (coexisting densities, critical point data, and vapor pressures) with some benchmark calculations in the literature.  If your agreement with the literature data is not good, speculate why there are differences.  Also, if there are any differences among the data reported in the literature citations, which data sets do you believe are most reliable, and why?  You can find the necessary literature data in the following articles [[8]](Interfacial_tension/References#ref_rio),[[9]](Interfacial_tension/References#ref_orea),[[10]](Interfacial_tension/References#ref_vega):


*  F. del Rio, et al. "Vapor-liquid equilibrium of the square-well fluid of variable range via a hybrid simulation approach," *Molecular Physics* **100**(15), 2531-2546 (2002).


*  P. Orea, Y. Duda, and J. Alejandre "Surface tension of a square well fluid," *Journal of Chemical Physics* **118**(12), 5635-5639 (2003).


*  L. Vega, et al. "Phase equilibria and critical behavior of square-well fluids of variable width by Gibbs ensemble Monte Carlo simulation," *Journal of Chemical Physics* ** 96**(3), 2296-2305 (1996).



**(b)** Using the default simulation parameters (or you may also try a larger simulation size), perform a simulation high above the critical temperature (T*=1.50), expand the simulation box, and let the system equilibrate.  Then, reduce the temperature to slightly below the critical temperature (T*=1.10 or 1.15).  In theory, your system should immediately separate into a vapor and a liquid phase at these temperatures.  *Is this what you observe? If not, why?*



**(c)** In the interfacial tension module, the density profile tends to converge rather quickly, while the value of the interfacial tension typically requires much more simulation time to converge.  *What is the reason for this?*



**(d)** You can calculate the interfacial tension directly from the 'Tension Profile' tab by numerically integrating the interfacial tension along the length of the simulation cell.  *Try performing the numerical integration using this figure (you will have to do some estimation from the plot), and compare your integration results with your previously reported values.*



**(e)** The width of the interface tends to increase as a function of the temperature.  *What is the limiting value of the interfacial width as the critical temperature is approached?  Can you fit this data to a scaling relationship, similar to the interfacial tension data?*



**(f)** In the Level 1 problems, you were able to predict the critical temperature by either extrapolating the density data or extrapolating the interfacial tension data.  *Which approach do you think is more reliable and why?*