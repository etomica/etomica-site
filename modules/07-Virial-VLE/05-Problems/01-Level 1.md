

These problems are suitable for students in a thermodynamics course (undergraduate level physical chemistry)

**Problem 1**

Use the Virial module to determine LJ potential parameters and a quadrupole moment for
CO<sub>2</sub> from experimental data. The virial coefficient B for this gas can be fitted well to the experimental data
points using the equation:

$B(T) = -127 - 288 \left (\frac{T_0}{T} - 1 \right ) - 118 \left( \frac{T_0}{T} - 1 \right)^2$    ..... (Equation 10)



with T in Kelvin, *B* in cm<sup>3</sup> mol<sup>-1</sup> and *T*<sub>0</sub> = 298.15K (source: *CRC Handbook of Chemistry and Physics*).
Use this equation (e.g. in Excel or another spreadsheet software, or evaluate each *B(T)* separately using
a calculator) to generate a table with: Temperatures *T* ranging from 230 to 330 K in steps of 5K, and the
virial coefficient *B* at each temperature. Use these data as input for the Virial module and find a set of
suitable *Q*, $\sigma$, $\varepsilon$ that matches the experimental data best. Report the results along with a screen shot of the Virial window showing the graph and how it matched the experimental data.

**Problem 2**

1. Use the results of Problem 1, or *Q*, &sigma;, &epsilon; values provided by the instructor, and run simulations with the VLE module for CO<sub>2</sub>. The *T* range is 230 to 305 K. The class may be divided into different groups who run simulations at different temperatures. E.g. with 3 groups, group 1 runs simulations at 230, 245,265...K, group 2 runs simulations at 235, 250, 26...K, and group 3 runs simulations at 240, 255, 270... K. With smaller classes, if computing time is an issue, the simulations may also be performed at 10 K intervals, although it is recommended to use smaller intervals at the highest temperatures.
1. Based on the simulation data from *well converged* simulations, use a spreadsheet program such a Excel to generate a table with the following 5 columns: Temperature in K, Liquid density in mol/L, the Error in the liquid density in mol/L, the Vapor density in mol/L, and the Error in the vapor density (mol/L). Also report in each row the number of integrator steps after which the averages were taken.
1. Prepare a plot with the temperature on the vertical (“y”) axis versus the density on the horizontal (“x”) axis, using the two data sets for the liquid and the vapor density. Use a “points” plot style, i.e. don’t connect the points with a line. Both data sets should be in the same plot. If necessary, combine the data columns for the vapor and the liquid prior to plotting in a separate table, i.e. make one combined column containing the density value columns for the vapor and the liquid stacked on top of each other, and paste the corresponding temperatures in another column of the same (double) length to have the necessary XY data for the plot. Label the graph axes correctly and make sure that the plot range for both axes is adjusted such that the resulting curve fills most of the plot area.
1. Compare the data with textbook examples, e.g. in Berry et al.'s *Physical Chemistry* [[4]](../References#ref4). Print out your plot of the simulated data and draw a “fit line” through the points to obtain a *T* –vs.–density curve similar to that shown in Fig. 24.11 of Berry et al.’s book. Use this curve to obtain a rough estimate of the critical temperature and the critical density of CO<sub>2</sub>.
1. Obtain experimental data for CO<sub>2</sub> [from NIST](http://webbook.nist.gov/chemistry/fluid/). On the WWW form, select “carbon dioxide” under point 1, keep the units at their default values under point 2, select “Isochoric properties” under point 3, leave 4. at its default value “Default for fluid”, press “Continue”. On the next screen, enter your estimate for the critical density from step (iv) in the first field, and select the temperature range and increment to be the same as in your simulations of step (i). If you have Java (not Javascript) *dis*abled you need to *uncheck* the box after “Check here if you want to use the display applet (requires Java capable browser)”. Click the “Press for data” button. If you do not have Java enabled you get tables with, among other data, the liquid and vapor densities at the selected temperatures. Further down, under “Auxiliary Data” you find the experimental values for the critical temperature and density. You can also access the data by clicking “Download data as a tab-delimited text file”. Copy or import the liquid and vapor densities at the various temperatures into a spreadsheet program. Plot T versus the liquid and vapor phase densities in the same way as you did with the computed data under point (iv). If you have Java enabled, in addition to the “Auxiliary Data”, near the top of the results screen you should see a data plot. By default, the vertical axis is Pressure and the horizontal is Temperature. You can change this: Select “Temperature (K)” in the “Y:” list and “Density (mol/L)” under “X:”. The plot should look very similar to the one you got under (iv). Access the raw data by clicking “View data in HTML table” and proceed as in the previous paragraph. Discuss the results from the simulation and the experiment. How do the critical point data compare? Report absolute and relative (per–cent) deviations between theory and experiment. What magnitude of errors did you expect before making a direct comparison between theory and experiment?

**Problem 3**

As the system approaches the critical point, the *difference* in the liquid and vapor density has the following behavior [[4]](../References#ref4)

$\alpha \mid T_c - T \mid^{\beta} = \rho_L - \rho_V$    ..... (Equation 11)



where $\alpha$ is a constant of proportionality, $T_c$ is the critical temperature, and $\beta \approx 0.326$ is called the critical  exponent. Denoting $\bar{\beta} = \beta^{-1} \approx 3.067$, we can therefore write

$\alpha \mid T_c - T \mid = (\rho_L - \rho_V)^{\bar{\beta}}$    ..... (Equation 12)



Obtain an estimate for $T_c$ from your computed data (Problem 2) by plotting the calculated $(\rho_L - \rho_V)^{3.067}$ as
a function of *T* . You should obtain a set of data points which ideally lie on a straight line as the temperature
approaches $T_c$. At the “x–intercept”, i.e. where $(\rho_L - \rho_V)^{3.067} = 0$ the temperature equals $T_c$. Either use a least squares fit to fit the data to a linear equation in your spreadsheet program ( [Excel instructions](http://www.chem.purdue.edu/gchelp/tools/graphing.html)), or
print out the data plot and obtain the linear fit parameters “by hand”. From the linear equation or the hand–
drawn fit, determine a numerical estimate for *T*<sub>c</sub>. If there are not enough points near the horizontal axis
intercept perform a few additional simulations close to the *computed* critical point. How does the result
compare with experiment? How does it compare with your estimate of Problem 2, step (iv)?

**Problem 4**

Consider the two equations for the LJ potential in the Background section, Eqs. (3) and (4).  Assuming that the two potentials are identical, derive the relation between &sigma; and $R_0$. From this, and the $\sigma$ value obtained in Problem 1 or as provided by the instructor, calculate the distance where the LJ potential for CO<sub>2</sub> has its minimum.